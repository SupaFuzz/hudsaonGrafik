class hudsonGrafikAdmin extends tcApplicationCore {


/*
    constructor
*/
constructor(args, defaults, callback){
    super(args, tcObjectCore.mergeClassDefaults({
        _version:             1,
        _className:           'hudsonGrafikAdmin',
        _dataFiles:           {}
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
        let pk = [];
        ['consumables_inventory.csv', 'parts_inventory.csv', 'product_inventory.csv'].forEach(function(fileName){
            console.log(`fetch ${fileName}`)
            pk.push(
                that.fetch({
                    endpoint:           `../data/${fileName}`,
                    method:             'GET',
                    expectHtmlStatus:   200
                }).catch(function(error){
                    console.log(`fetch error: ${error}`)
                    throw(error);
                }).then(function(xhr){
                    console.log('parse')
                    // xhr.response has the data which we need to parse
                    that._dataFiles[fileName] = that.CSVToArray(xhr.response);
                })
            );
        });
        Promise.all(pk).catch(function(error){
            throw(error);
        }).then(function(){
            console.log('all files fetched: ', that._dataFiles);

            /*
                LOH 2/21/21 @ 2253
                everything works up to here, next step is to render it all on the screen
                in such a way as it's editable. Lots of cool ideas come to mind, but the
                simplest brutalist is to make an "add a row" form at the bottom and a
                "remove the row" checkbox on each row. Old school and straight forward.

                an in-place edit widget would kick ass though
                actually ... as would an adaptation of the formView idea.
                each column being a field. Or perhaps selecting a row and having
                a drop in replacement thing I dunno ...

                RESUME 2/27/21 @ 1403
            */
            let productTable = that.renderTable(`product_inventory.csv`);
            if (productTable instanceof Element){ document.body.appendChild(productTable);}

            toot(that);
        })
    }));
}




/*
    renderTable(dataFileName)
    render an html table from CSVToArray output
*/
renderTable(dataFileName){
    let that = this;

    // bounce for no datafile
    if (! (that._dataFiles[dataFileName] instanceof Object)){
        that.log(`renderTable called for ${dataFileName} | dataFile does not exist or is not yet loaded`);
        return(null);
    }

    let div = document.createElement('div');
    div.className = 'csvTable';
    div.setAttribute('id', that.getGUID());

    let thead = [];
    let tbody = [];
    that._dataFiles[dataFileName].forEach(function(rowb, idx){
        let row = '<tr>';
        let tag = (idx == 0)?'th':'td';
        rowb.forEach(function(col){ row += `<${tag}>${col}</${tag}>`; });
        row += `</tr>`;
        if (idx == 0){ thead.push(row); }else{ tbody.push(row); }
    })

    /*
        LOH 2/27/21 @ 1434
        next step is to detect if we've got an image filename and pull that in
        then figure out how to interact with it.
    */

    div.insertAdjacentHTML('afterbegin', `
        <table>
            <thead>${thead.join('')}</thead>
            <tbody>${tbody.join('')}</tbody>
        </table>
    `);

    return(div);
}



/*
    CSVToArray( strData, strDelimiter)
	https://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
*/
 CSVToArray( strData, strDelimiter ){

	// comma is default delimiter
	strDelimiter = (strDelimiter || ",");

	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
		(
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);


	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];

	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;


	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){

		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];

		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
			strMatchedDelimiter.length &&
			(strMatchedDelimiter != strDelimiter)
			){

			// Since we have reached a new row of data,
			// add an empty row to our data array.
			arrData.push( [] );

		}


		// Now that we have our delimiter out of the way,
		// var's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){

			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			var strMatchedValue = arrMatches[ 2 ].replace(
				new RegExp( "\"\"", "g" ),
				"\""
				);

		} else {

			// We found a non-quoted value.
			var strMatchedValue = arrMatches[ 3 ];

		}


		// Now that we have our value string, var's add
		// it to the data array.
		arrData[ arrData.length - 1 ].push( strMatchedValue );
	}

	// Return the parsed data.
	return( arrData );
} // end CSVToArray




} // end class
