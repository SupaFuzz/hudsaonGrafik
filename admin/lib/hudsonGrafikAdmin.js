class hudsonGrafikAdmin extends tcApplicationCore {


/*
    constructor
*/
constructor(args, defaults, callback){
    super(args, tcObjectCore.mergeClassDefaults({
        _version:             1,
        _className:           'hudsonGrafikAdmin',
    }, defaults), callback);
}


/*
    startup()
*/
startup(){
    let that = this;
    return(new Promise(function(toot, boot){

        that.log(`startup initiated`);

        // fetch the csv files
        



        toot(that);

    }));
}





} // end class
