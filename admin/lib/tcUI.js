/*
    tcUIjs        12/30/20   Amy Hicox <amy@hicox.com>
*/




/*
    CLASS   tcUIElement
*/
class tcUIElement extends tcUtility {




/*
    constructor
*/
constructor(args, defaults, callback){
    super(args, tcObjectCore.mergeClassDefaults({
        _version:       1,
        _className:     'tcUIElement',
        _visibility:    'visible',
        _onScreen:      false,
        _isRendered:    false,
        _type:           'HTML',
        _html:          null,
        deferRender:    false,
        classList:      [],
        style:          {},
        rootElementType:'div',
        _namespaces:    {
            'HTML':   'http://www.w3.org/1999/xhtml',
            'SVG':    'http://www.w3.org/2000/svg',
            'MathML': 'http://www.w3.org/1998/Math/MathML'
        },
        _templateElements: {},
        _clones:           {},
        templateElementClassName: 'tcuiTemplateField',
        disableTemplate: false
    },defaults), function(myself){
        if (callback instanceof Function){ callback(myself); }
        if (! myself.hasAttribute('name')){ myself.name = myself._className; }
        if (myself.classList.indexOf(myself._className) < 0){ myself.classList.push(myself._className); }
        myself.guid = myself.hasAttribute('id')?myself.id:myself.getGUID();
        if (myself.deferRender !== true){ myself.render(myself.rootElementType); }
    });
}




/*
    html getter & setter
*/
set html(val){
    this._html = val;
    if (this.hasOwnProperty('DOMElement')){ this.update(); }
}

get html(){
    let that = this;

    if (this.hasAttribute('getHTMLCallback') && (this.getHTMLCallback instanceof Function)){
        try {
            return(that.getHTMLCallback(that));
        }catch(e){
            throw(new tcException({
                message:        `getHTMLCallback threw an error: ${e.toString()}`,
                messageNumber:   100,
                thrownBy:       `${that._className}/html`
            }));
        }
    }else if (this.isNotNull(this._html)){
        return(this._html);
    }else{
        return(null)
    }
}




/*
    type getter and sertter
*/
get type(){ return(this._type); }
set type(v){
    if (Object.keys(this._namespaces).indexOf(v) < 0){
        throw(new tcException({
            message:        `${this._className}| type setter | given value is not supported`,
            messageNumber:   101,
            thrownBy:       `${that._className}/type`
        }));
    }else{
        this._type = v;
    }
}
get typeNamespace(){
    return((this.isNotNull(this._type) && this._namespaces.hasOwnProperty(this._type))?this._namespaces[this._type]:null);
}



/*
    onScreen getter
*/
get onScreen(){ return(
    (this.DOMElement instanceof Element) &&
    (this.DOMElement.parentElement instanceof Element)
)}




/*
    isRendered getter
*/
get isRendered(){ return((this.DOMElement instanceof Element)); }




/*
    visibility getter/setter
*/
get visibility(){
    return (this.isRendered?this.DOMElement.style.visibility:this._visibility);
}
set visibility(v){
    this._visibility = v;
    if (this.isRendered){ this.DOMElement.style.visibility = this._visibility; }
}




/*
    applyNecessaryStyle()
*/
applyNecessaryStyle(){
    if ((this.style instanceof Object) && (this.DOMElement instanceof Element)){
        Object.keys(this.style).forEach(function(cssProperty){ this.DOMElement.style[cssProperty] = this.style[cssProperty] }, this);
    }
}




/*
    render(elementType)
    create a root element of type elementType (default is 'div'), then inject the html into it

    create a div in the documentFragment with id=this.guid
    the classlist and containing this.html
    separate function from constructor because subclasses will likely need to override this
    render should be chainable, so we always return this (even if you override it stil do this)

    note to make SVG stuff
    document.createElementNS('http://www.w3.org/2000/svg', 'path');
*/
render(elementType){

    // create root element (this.DOMElement)
    let type = this.isNull(elementType)?'div':elementType;
    if (this.type == 'HTML' || this.isNull(this.typeNamespace)){
        this.DOMElement = document.createElement(elementType);
    }else{
        this.DOMElement = document.createElementNS(this.typeNamespace, elementType);
    }
    this.DOMElement.id = this.guid;

    // apply classList to root element
    this.classList.forEach(function(c){ this.DOMElement.classList.add(c); }, this);

    // insert this.html as root element HTML content
    let t = this.html;
    if this.isNotNull(t){
        this.DOMElement.innerHTML = this.html;
    }

    // apply this.style to root element
    this.applyNecessaryStyle();

    // find n' bind templateElements if we have any
    if (! (this.disableTemplate === true)){ this.updateElementMap(); }

    // call the renderCallback()
    let that = this;
    if (this.renderCallback instanceof Function){ that.renderCallback(that); }

    return(this);
}




/*
    updateElementMap(oldElementMap)
    find all of the templateElements present in our private DOM tree
    then make sure we have attribute acessors set up for each

    oldElementMap, if specified is the previous value of 'templateElements'
    this allows us to weed out attribute acessors that are not in the new list
    if it has changed
*/
updateElementMap(oldElementMap){
    let that = this;

    // setup templateElements we find in our html
    if (this.DOMElement instanceof Element){
        that.templateElements = {};
        this.DOMElement.querySelectorAll(`.${that.templateElementClassName}`).forEach(function(el){
            if ((el.dataset.fieldname) && that.isNotNull(el.dataset.fieldname)){
                if (! that.templateElements.hasOwnProperty(el.dataset.fieldname)){
                    that.templateElements[el.dataset.fieldname] = {
                        name: el.dataset.fieldname,
                        refs: []
                    };
                }
                that.templateElements[el.dataset.fieldname].refs.push(el)
            }
        });
    }

    // remove defunct attribute accessors
    if (oldElementMap instanceof Object){
        Object.keys(oldElementMap).forEach(function(oldElementName){
            if (! that.templateElements.hasOwnProperty(oldElementName)){ delete that[oldElementName]; }
        })
    }

    // set up attribute acessors for each of the templateElements (that we haven't already setup)
    Object.keys(this.templateElements).forEach(function(fieldName){
        let tmp = Object.getOwnPropertyDescriptor(that, fieldName);
        if (! ((that.isNotNull(tmp) && (tmp.set instanceof Function)))){
            Object.defineProperty(that, fieldName, {
                get:          function(){ return(that.getTemplateElement(fieldName)); },
                set:          function(v){ that.setTemplateElement(fieldName, v); }
            });
        }
    });
}




/*
    update()
    replace the innerHTML of this.DOMElement with this.html
    necessarily calling getHTMLCallback (if defined).
    This is a component of "data binding" where in we can set
    data attributes on the object then reference them in getHTMLCallback
*/
update(){
    // update the html
    this.DOMElement.innerHTML = this.html;
    this.updateElementMap();


    // re-run the render callback to hang all ye hooks while ye may ...
    let that = this;
    if (this.hasAttribute('renderCallback') && (this.renderCallback instanceof Function)){ that.renderCallback(that); }

    return(this);
}




/*
    append(<DOM Element>)
*/
append(DOMElement){

    if (this.isNotNull(DOMElement) && (DOMElement instanceof Element) && (this.DOMElement instanceof Element)){
        DOMElement.appendChild(this.DOMElement);
        return(this);
    }else{
        return(null);
    }
}




/*
    remove()
*/
remove(){
    if (this.isRendered){ this.DOMElement.remove(); }
}




/*
    getEventListener(<functionReference>)
    return a function in which we call thusly:

        functionReference(event, self)

    this allows us to pass a self reference to event handlers
    and it allows you to save a variable reference to the function
    so you can remove it from the eventHanler later
*/
getEventListenerWrapper(functionReference){
    let that = this;
    return(
        function(e){ functionReference(e, that); }
    )
}




/*
    the getter & setter that all of the templateElements acessors point to
    if you send an instance of Element we will simply empty the templateElement's
    DOM tree and append the specified Element as a child.
*/
getDOMAttributeTextValue(attribute){
    if (this.hasOwnProperty(`_${attribute}`)){
        if (this[`_${attribute}`] instanceof Element){
            return(this[`_${attribute}`].textContent)
        }else{
            return(this[`_${attribute}`])
        }
    }else{
        return(null)
    }
}
getTemplateElement(elementName){
    let t = {};
    this.formElements[elementName].refs.forEach(function(el){ t[el.textContent] += 1; });
    if (Object.keys(t).length > 1){
        return(Object.keys(t).sort());
    }else{
        return(Object.keys(t)[0]);
    }
}

}
setTemplateElement(elementName, value){
    this.formElements[elementName].refs.forEach(function(el){
        // clear it
        el.innerHTML = '';

        // replace it
        if (value instanceof Element){
            let t = value.cloneNode(true);
            if (this.templateElements[elementName].refs.length > 1){
                el.appendChild(t);
            }else{
                el.append(t);
            }

        // update text
        }else{
            el.textContent = value;
        }
    }, this);
    this.DOMElement.dataset[elementName] = value;
}



}
/*
    END CLASS   tcUIElement
*/








/*
    CLASS   tcUI
*/
class tcUI extends tcUIElement {




/*
    constructor
*/
constructor(args, defaults, callback){
    super(args, tcObjectCore.mergeClassDefaults({
        _version:       1,
        _className:     'tcUI',
        _name:          null,
        _focus:         false,
        _fistFocus:     true
    },defaults), callback);
}




/*
    focus getter & setter
*/
get focus(){ return(this._focus); }
set focus(b){
    if ((this._firstFocus) && (b === true)){
        if (this.setup instanceof Function){ this.setup(); }
        this._firstFocus = false;
    }
    this.setFocus((b === true), null);
}
async setFocus(focus, focusArgs){

    // call the focusCallback such that it can cancel the focus set by throwing
    if (this.focusCallback instanceof function){
        if (this.focusCallback.constructor.name == 'AsyncFunction'){
            this.focusCallback((b === true), focusArgs, this).catch(function(e){
                throw(new tcException({
                    message:        `${this._className} | setFocus | focusCallback (async) threw unexpectedly: ${e.toString()}`,
                    messageNumber:   100,
                    thrownBy:       `${that._className} | setFocus | focusCallback (async)`,
                    errorObject:    e
                }));
            }).then(function(){
                this._focus = (b === true);
                return(true);
            });
        }else{
            try {
                this.focusCallback((b === true), focusArgs, this);
            }catch(e){
                throw(new tcException({
                    message:        `${this._className} | setFocus | focusCallback threw unexpectedly: ${e.toString()}`,
                    messageNumber:   100,
                    thrownBy:       `${that._className} | setFocus | focusCallback`,
                    errorObject:    e
                }));
            }
            this._focus = (b === true);
            return(true);
        }
    }else{
        this._focus = (b === true);
        return(true);
    }
}




/*
    setup()
    override this in child classes to catch the _firstFocus event
*/
setup(){
    console.log(`${this._className} setup() called`);
}




/*
    receiveMessage(msg)
    override this in child classes to catch events from the parent tcUIFrame
*/
receiveMessage(msg){
    console.log(`${this._className} receiveMessage() called`);
}




/*
    END CLASS   tcUI
*/




/*
    CLASS   tcUIFrame
*/




/*
    constructor
*/
constructor(args, defaults, callback){
    super(args, tcObjectCore.mergeClassDefaults({
        _version:       1,
        _className:     'tcUIFrame',
        UIList:         {}
    },defaults), callback);
}




/*
    addUI(tcUIObject, name)
    <name> overrides ui.name if specified
*/
addUI(ui, name){
    if (
        (ui instanceof tcUI) && (
            ui.hasAttribute('name') ||
            this.isNotNull(name)
        )
     ){
        let id = this.isNotNull(name)?name:ui.name;
        if (this.UIList.hasOwnProperty(id)){
            throw(new tcException({
                message:        `${this._className} | addUI: the specified UI ${id} already exists. remove first`,
                messageNumber:   200,
                thrownBy:       `${this._className} | addUI`
            }));
        }else{
            this.UIList[id] = ui;
            this.UIList[id].parentUIFrame = this;
        }
     }else{
         throw(new tcException({
             message:        `${this._className} | addUI: invalid arguments`,
             messageNumber:   201,
             thrownBy:       `${this._className} | addUI`
         }));
     }
}




/*
    getUI(name)
*/
getUI(uiName){
    return(this.UIList.hasOwnProperty(uiName)?this.UIList[uiName]:null);
}




/*
    removeUI(name)
*/
removeUI(uiName){
    let UI = this.getUI(uiName);
    if (this.isNotNull(UI)){
        if (UI.focus){
            try {
                UI.focus = false;
            }catch(e){
                throw(new tcException({
                    message:        `${this._className} | removeUI: UI lose focus threw error: ${e}`,
                    messageNumber:   202,
                    thrownBy:       `${this._className} | removeUI`
                }));
            }
        }
        if (UI.onScreen){ UI.remove(); }
        delete(this.UIList[uiName]);
    }
}




/*
    focusUI(name, focusArgs)
    give focus to one of the UIs
    override this if you want differnt behavior.
    this is just your basic "display one card at a time" switcher
*/
focusUI(uiName, focusArgs){

    // all focused UIs must first relinquish focus peacefully
    let pk = [];
    Object.keys(this.UIList).forEach(function(name){
        if (this.UIList[name].focus){
            pk.push( this.UIList[name].setFocus(false, focusArgs).then(function(){ this.UIList[name].remove()}) );
        }
    });
    Promise.all(pk).catch(function(error){
        throw(new tcException({
            message:        `${this._className} | focusUI: focussed UI lose focus threw error: ${e}`,
            messageNumber:   203,
            thrownBy:       `${this._className} | focusUI`
        }));
    }).then(function(){

        // show the new one
        let UI = this.getUI(uiName);
        if (this.isNotNull(UI)){
            UI.setFocus(true, focusArgs).catch(function(error){
                throw(new tcException({
                    message:        `${this._className} | focusUI: gain focus threw error: ${e}`,
                    messageNumber:   204,
                    thrownBy:       `${this._className} | focusUI`
                }));
            }).then(function(){
                UI.append(this.DOMElement);
            });
        }
    });
}



/*
    END CLASS   tcUIFrame
*/
