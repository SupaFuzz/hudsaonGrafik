/*
    tonicCore.js        12/29/20   Amy Hicox <amy@hicox.com>
*/




/*
    CLASS   tcObjectCore

    this class defines a constructor model and self-serialization accessor.
*/
class tcObjectCore {




/*
    tcObjectCore.mergeClassDefaults({classDefaults}, {argDefaults})
    return an object consisting of every key/value in {argDefaults} and
    every key/value in {classDefaults} that does not exist in {argDefaults}
*/
static mergeClassDefaults(classDefaults, argDefaults){
    let tmp = {};
    if (classDefaults instanceof Object){
        Object.keys(classDefaults).forEach(function(classDefaultKey){
            tmp[classDefaultKey] = classDefaults[classDefaultKey];
        });
    }
    if (argDefaults instanceof Object){
        Object.keys(argDefaults).forEach(function(argDefaultKey){
            tmp[argDefaultKey] = argDefaults[argDefaultKey];
        });
    }
    return(tmp);
}




/*
    constructor (as described above)

    the gist of the constructor:
        _attribute      => hidden
        __attribute     => hidden but self.json can see it, inserted into this._unhideOnSerialize

        (this.attribute && (this._attribute || this.__attribute)){
            // this.attribute is not created, but is set in this._useChildClassSetter
        }

    functions:
        * this.json                     (getter and setter)
        * this.epochTimestamp(bool)     (get epoch, true arg gets high res)
        * this.isNull(value)            (returns true if value is one of the many kinds of null)
        * this.isNotNull(value)
        * this.hasAttribute(key)

*/
constructor (args, defaults, callback){

    // merge class defaults with constructor defaults
    let _classDefaults = tcObjectCore.mergeClassDefaults({
        _className:         'tcObjectCore',
        _version:           1
    }, defaults);

    // helper function to spawn the attributes
    function createAttribute(self, key, val){
        if (/^__/.test(key)){ self._unhideOnSerialize[key] = 1; }
        Object.defineProperty(self, key, {
            value:        val,
            writable:     true,
            enumerable:   (! (/^_/.test(key))),
            configurable: true
        });
    }

    // merge _classDefaults (now containining {defaults}) with {args} into a master key/value list
    let masterKeyList = {};
    [_classDefaults, args].forEach(function(attributeSet){
        if (attributeSet instanceof Object){
            Object.keys(attributeSet).forEach(function(key){
                masterKeyList[key] = attributeSet[key];
            });
        }
    });

    // stash any double underscore attributes in this._unhideOnSerialize
    createAttribute(this, '_unhideOnSerialize', {});

    // stash any non-underscore versions of an underscore key in this._useChildClassSetter
    createAttribute(this, '_useChildClassSetter', {});

    // spawn attribute or stash in _useChildClassSetter
    Object.keys(masterKeyList).forEach(function(key){

        // send non-underscore versions of underscore attributes to _useChildClassSetter
        if ((! /^_/.test(key)) && ((masterKeyList.hasOwnProperty(`_${key}`)) || (masterKeyList.hasOwnProperty(`__${key}`)))){
            this._useChildClassSetter[key] = masterKeyList[key];
        }else{
            createAttribute(this, key, masterKeyList[key]);
        }
    }, this);

    // handle callback if we have one
    if (callback instanceof Function){
        callback(this);
    }

} // end constructor




/*
    getter and setter for json
*/
get json(){
    let tmp = {};
    Object.keys(this).forEach(function(key){ tmp[key] = this[key]; }, this);
    Object.keys(this._unhideOnSerialize).forEach(function(key){ tmp[key] = this[key]; }, this);
    return(JSON.stringify(tmp));
}
set json(json){
    let tmp = JSON.parse(json);

    // blow everything in if the child class has a setter, it'll handle it by here since we're out of the constructor
    Object.keys(tmp).forEach(function(key){ this[key] = tmp[key]; }, this);
}




/*
    isNull(value)
*/
isNull(val){
    return(
       (typeof(val) === 'undefined') ||
       (val === null) ||
       (val === undefined) ||
       (val == "null") ||
       (/^\s*$/.test(val))
    );
}




/*
    isNotNull(value)
    return the inverse of isNull()
*/
isNotNull(val){ return(! this.isNull(val)); }




/*
    epochTimestamp(hiResBool)
*/
epochTimestamp(bool){
    if (bool === true){
        return(new Date().getTime());
    }else{
        return(Math.round(new Date().getTime() / 1000));
    }
}




/*
    hasAttribute(attributeName)
    return true if this has <attributeName> and
    the value of that attribute is not null
*/
hasAttribute(attributeName){
    return(this.hasOwnProperty(attributeName) && this.isNotNull(this[attributeName]));
}




}
/*
    END CLASS   tcObjectCore
*/








/*
    CLASS   tcChildClass

    this tacks onto the default tcObjectCore constructor
    to handle calling setters in a child class context
*/
class tcChildClass extends tcObjectCore {

    /*
        constructor
        if you write your child class extensions from here
        you can use this slick child class default constructor
        which will handle passthrough defaults as well as
        post-super() attribute initialization that knows how to
        call local attribute setters
    */
    constructor(args, defaults, callback){

        let _classDefaults = tcObjectCore.mergeClassDefaults({
            _className:     'tcChildClass',
            _version:       1
        }, defaults);
        super(args, _classDefaults, callback);

        // handle invoking child-class setters ...
        if ((this.hasAttribute('_useChildClassSetter')) && (this._useChildClassSetter instanceof Object)){
            Object.keys(this._useChildClassSetter).forEach(function(key){
                this[key] = this._useChildClassSetter[key];
            }, this)
        }
    }
}
/*
    END CLASS   tcChildClass
*/








/*
    CLASS   tcException
    this is an exception class to handle exceptions thrown by our own code.
*/
class tcException extends tcChildClass {

constructor(args, defaults, callback){
    let _classDefaults = tcObjectCore.mergeClassDefaults({
        _version:            2,
        _className:          'tcException',
        fatal:               false,
        sendExceptionEvent:  false,
        exceptionEventName:  '_tcException',
        message:             'no message specified',
        messageNumber:       0,
        thrownBy:            '(unknown)'
    }, defaults);

    // set it up
    super(args, _classDefaults, callback);

    // capture high res timestamp
    this.time = this.epochTimestamp(true);

    /*
        if sendExceptionEvent is turned on, we're going to send a copy of
        the entire exception object to the document event named by exceptionEventName
        things that care about it (such as loggers) can subscribe to this event
    */
    if (this.sendExceptionEvent){
        document.dispatchEvent(new CustomEvent(this.exceptionEventName, {'detail':this}));
    }
}

toString(){
    return(`[fatal: ${this.fatal}] [messageNumber ${this.messageNumber}] [thrownBy: ${this.thrownBy}] ${this.message}`);
}

}
/*
    END CLASS   tcException
*/








/*
    CLASS   tcUtility
    this adds some utility functions to the tcChildClass
*/
class tcUtility extends tcChildClass {

// minimal constructor
constructor(args, defaults, callback){
    let _classDefaults = tcObjectCore.mergeClassDefaults({
        _version:            2,
        _className:          'tcUtility',
        _usedGUIDs:         [],
        usedGUIDMaxCache:   1000
    }, defaults);

    // set it up
    super(args, _classDefaults, callback);
}




/*
    toEpoch(string, bool)
    <string> contains the string to attempt to convert into an epoch integer
    <bool> (default true), if false returns course value (seconds), if true fine (milliseconds)
*/
toEpoch(date, fine){

    /*
        Safari refuses to parse legit ISO8601 dates with a 4 digit timezone
        offset specified, unless the timezone offset includes a colon.
        I could literally slap the hell out of some pedantic asshole at Apple right now.
        enabling the check below will cost ya cpu
    */
    //if (isNaN(Date.parse(date)) && /[+|-]\d{4}$/.test(date)){
    if (/[+|-]\d{4}$/.test(date)){
        date = `${date.substr(0,(date.length -2))}:${date.substr(-2)}`;
    }


    try {
        return((fine === true)?Date.parse(date):(Math.floor(Date.parse(date)/1000)));
    }catch(e){
        throw(new tcException({
            message:        `failed to parse timestamp: ${e}`,
            messageNumber:   1,
            thrownBy:       'tcUtility/toEpoch',
            thrownByArgs:   [date, fine],
        }));
    }
}




/*
    fromEpoch(integer, type)
    <integer> is the epoch timestamp (course values will be backfilled to fine)
    <type> is an enum: date | time | dateTime | dateTimeLocale
    returns an ARS/REST compatible ISO 8601 date / time / dateTime string
    except dateTimeLocale which returns human readable dateTime string in client timezone
*/

fromEpoch(epoch, type){

    // ya rly
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }

    // sort out the epoch format
    if (this.isNull(epoch)){
        throw(new tcException({
            message:        'specified null epoch value',
            messageNumber:   2,
            thrownBy:       'tcUtility/fromEpoch',
            thrownByArgs:   [epoch, type],
        }));
    }
    try {
        epoch = parseInt(epoch.toString(), 10);
        //
        if (epoch <= 9999999999){ epoch = (epoch * 1000);}
    }catch(e){
        throw(new tcException({
            message:        `failed integer conversion of given epoch time: ${e}`,
            messageNumber:   3,
            thrownBy:       'tcUtility/fromEpoch',
            thrownByArgs:   [epoch, type],
        }));
    }

    // convert it
    switch(type){
        case 'date':
            try {
                let myDate = new Date(epoch);
                return(`${myDate.getUTCFullYear()}-${pad(myDate.getUTCMonth() + 1)}-${pad(myDate.getUTCDate())}`)
            }catch(e){
                throw(new tcException({
                    message:        `failed conversion (date): ${e}`,
                    messageNumber:   4,
                    thrownBy:       'tcUtility/fromEpoch',
                    thrownByArgs:   [epoch, type],
                }));
            }
        break;
        case 'time':
            try {
                let myDate = new Date(epoch);
                return(`${pad(myDate.getUTCHours())}:${pad(myDate.getUTCMinutes())}:${pad(myDate.getUTCSeconds())}`)
            }catch(e){
                throw(new tcException({
                    message:        `failed conversion (time): ${e}`,
                    messageNumber:   5,
                    thrownBy:       'tcUtility/fromEpoch',
                    thrownByArgs:   [epoch, type],
                }));
            }
        break;
        case 'dateTime':
            try {
                return(new Date(epoch).toISOString());
            }catch(e){
                throw(new tcException({
                    message:        `failed conversion (dateTime): ${e}`,
                    messageNumber:   6,
                    thrownBy:       'tcUtility/fromEpoch',
                    thrownByArgs:   [epoch, type],
                }));
            }
        break;
        case 'dateTimeLocale':
            try {
                return(new Date(epoch).toLocaleString());
            }catch(e){
                try {
                    return(new Date(epoch).toISOString());
                }catch(e){
                    throw(new tcException({
                        message:        `failed conversion (dateTimeLocale): ${e}`,
                        messageNumber:   6.5,
                        thrownBy:       'tcUtility/fromEpoch',
                        thrownByArgs:   [epoch, type],
                    }));
                }
            }
            break;
        default:
            throw(new tcException({
                message:        'invalid date type specified',
                messageNumber:   7,
                thrownBy:       'tcUtility/fromEpoch',
                thrownByArgs:   [epoch, type],
            }));
    }
}


/*
    getGUID()
    return a GUID. These are just random, but we do at least keep
    track of the ones we've issued and won't issue the same one
    twice within the same run instance
*/
getGUID(){
    let guid;
    do {
        // thank you stackoverflow!
        guid = 'tcxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    } while (this._usedGUIDs.indexOf(guid) >= 0);
    this._usedGUIDs.push(guid);
    if (this._usedGUIDs.length > this.usedGUIDMaxCache){ this._usedGUIDs.shift(); }
    return(guid);
}


}
/*
    END CLASS   tcUtility
*/








/*
    CLASS tcNetworkUtility
    this adds a network request dispatcher to tcUtility
*/
class tcNetworkUtility extends tcUtility {


/*
    default constructor to merge defaults
*/
constructor(args, defaults, callback){
    let _classDefaults = tcObjectCore.mergeClassDefaults({
        _version:            2,
        _className:          'tcNetworkUtility'
    }, defaults);
    super(args, _classDefaults, callback);
}


/*
    fetch({
        endpoint:           <url>
        method:             GET | POST | PUT | DELETE
        headers:            { header:value ...},
        content:            { object will be JSON.strigified before transmit }
        expectHtmlStatus:   <integer> (receiving this = reolve, else reject promise)
        timeout:            default 0, milli seconds after which to timeout the socket
        encodeContent:      <bool> default true
        responseType:       ??, but we're passing it through to the xhr
        progressCallback:   function(evt)
    })

    this creates an XHR of the specified method, pointing to the specified endpoint
    with specified headers and content, and returns a rejected or resolved
    promise. Rejected promises are tcExceptions, and are triggered either from
    timeout being exceeded or from not recieving an HTTP status response matching
    expectHtmlStatus. Resolved promises return the xhr object and the caller can
    work out what to do with that.
*/
fetch (args) {
    let self = this;
    let abort = false;
    return(new Promise(function(resolve, reject){

        /*
            input validations
        */
        ['endpoint', 'method', 'expectHtmlStatus'].forEach(function(k){
            if ((! typeof(args) == 'object') || (! args.hasOwnProperty(k)) || (self.isNull(args[k]))){
                abort = true;
                reject(new tcException({
                    message:        `required argument missing ${k}`,
                    messageNumber:   8,
                    thrownBy:       'tcUtility/fetch',
                    thrownByArgs:   args,
                }));
            }
        });

        // handle multiple expectHtmlStatus values
        let myOKStatuses = [];
        if ((typeof(args.expectHtmlStatus) == 'number') || (typeof(args.expectHtmlStatus) == 'string')) {
            myOKStatuses.push(args.expectHtmlStatus);
        }else{
            myOKStatuses = args.expectHtmlStatus;
        }

        // set up default timeout
        if (! args.hasOwnProperty('timeout')){ args.timeout = 0; }

        // set up the xhr
        let xhr = new XMLHttpRequest();
        if (args.timeout > 0){ xhr.timeout = args.timeout; }
        if (args.hasOwnProperty('responseType')){ xhr.responseType = args.responseType; }

        // success callback
        xhr.addEventListener("load", function(){
            if (myOKStatuses.indexOf(this.status) >= 0){
                resolve(this);
            }else{
                abort = true;
                reject(new tcException({
                    message:        `received unexpected HTTP status ${this.status}, expected ${myOKStatuses.join(", OR ")}`,
                    messageNumber:   10,
                    thrownBy:       'tcUtility/fetch',
                    thrownByArgs:   args,
                    'xhr':          this,
                    'event':        'load'
                }));
            }
        });

        // error callback
        xhr.addEventListener("error", function(){
            abort = true;
            reject(new tcException({
                message:        'received "error" event (probably a timeout)',
                messageNumber:   11,
                thrownBy:       'tcUtility/fetch',
                thrownByArgs:   args,
                'xhr':          this,
                'event':        'error'
            }));
        });

        // abort callback
        xhr.addEventListener("abort", function(){
            abort = true;
            reject(new tcException({
                message:        'received "abort" event (probably user cancel or network issue)',
                messageNumber:   12,
                thrownBy:       'tcUtility/fetch',
                thrownByArgs:   args,
                'xhr':          this,
                'event':        'abort'
            }));
        });

        // asynchronously call progress callback if we have one (evt.loaded / evt.total have progress data)
        if (args.hasOwnProperty('progressCallback') && (args.progressCallback instanceof Function)){
            xhr.addEventListener("progress", function(evt){ setTimeout(args.progressCallback(evt), 0); })
        }

        // open it up
        if (! abort){ xhr.open(args.method, args.endpoint); }

        // set request headers
        if ((! abort) && (args.hasOwnProperty('headers')) && (typeof(args.headers) === 'object')){
            try {
                Object.keys(args.headers).forEach(function(k){
                    xhr.setRequestHeader(k, args.headers[k]);
                });
            }catch(e){
                abort = true;
                reject(new tcException({
                    message:        `failed to set request headers: ${e}`,
                    messageNumber:   13,
                    thrownBy:       'tcUtility/fetch',
                    thrownByArgs:   args,
                    'xhr':          xhr
                }));
            }
        }

        // encode the content if we have it
        if ((! abort) && (args.hasOwnProperty('content'))){
            let encoded = '';
            if (args.encodeContent){
                try {
                    encoded = JSON.stringify(args.content);
                }catch(e){
                    abort = true;
                    reject(new tcException({
                        message:        `failed to encode content with JSON.stringify: ${e}`,
                        messageNumber:   14,
                        thrownBy:       'tcUtility/fetch',
                        thrownByArgs:   args,
                        'xhr':          xhr
                    }));
                }
            }else{
                encoded = args.content;
            }
            if (! abort){
                xhr.send(encoded);
            }
        }else if (! abort){
            xhr.send();
        }
    }));
}

}
/*
    END CLASS tcNetworkUtility
*/
