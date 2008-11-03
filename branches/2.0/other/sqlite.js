//
// Small library to ease handling offline sqlite databases in Safari
//
// Pari Nannapaneni <pari@digium.com>
//
// Copyright (C) 2008, Digium, Inc.
//
// This program is free software, distributed under the terms of
// the GNU General Public License Version 2. See the LICENSE file
// at the top of the source tree.
//

if (!window.openDatabase) { alert('No Database support! You need Safari (>=3.1) '); return; }

var SQLITE = function(DB){
	// Usage: var mydb = new SQLITE({ name:'AddressBook', version : '1.0', comment: 'My AddressBook', maxsize: 3200000 });
	if ( !(this instanceof SQLITE) ) { return new SQLITE(DB) ; }
	this.DBCONNECTION = null ;
	try {
		this.DBCONNECTION = openDatabase(DB.name, DB.version, DB.comment, DB.maxsize);
		if (!this.DBCONNECTION){
			alert("Failed to open the database on disk. This is probably because the version was bad or there is not enough space left in this domain's quota");
			return null;
		}
		return true;
	} catch(err) {
		return null;
	}
};

SQLITE.prototype = {
	ExecuteQuery : function( SQLOBJ ){
		// mydb.ExecuteQuery( { query:' select * from AddressBook where email=?' , Arguments:['pari@digium.com'], callBack: function(result){} } ); // Arguments, callBack are Optional
		if( this.DBCONNECTION === null ) return ;

		if( !SQLOBJ.Arguments ) SQLOBJ.Arguments = [];

		if( !SQLOBJ.hasOwnProperty('callBack') ){
			this.DBCONNECTION.transaction( function(tx) {
				tx.executeSql( SQLOBJ.query , SQLOBJ.Arguments , function(){}, function(tx, error){ alert('Error executing Query - ' + error.message); return;} );
			}) ;
			return ;
		}

		this.DBCONNECTION.transaction(
			function(tx) {
				tx.executeSql( SQLOBJ.query , SQLOBJ.Arguments , function(tx, result) {

					if( !result.rows.length ){
						SQLOBJ.callBack(null);
						return ;
					}
					var TMP_ARRAY = [];
					for (var i = 0, j = result.rows.length; i < j ; ++i) {
						TMP_ARRAY.push( result.rows.item(i) ) ;
					}
					SQLOBJ.callBack(TMP_ARRAY);
				},

				function(tx, error) {
					alert('Error executing Query - ' + error.message);
					return ;
				});
			}
		);
	},
	
	insertIntoTable : function( TABLENAME , OBJ_VALS ){
		// mydb.insertIntoTable( 'AddressBook' , { name:'someOne', Email:'someone@example.com', Foo: 'bar' } );
		var tmp_query_fields = [];
		var tmp_query_questionmarks = [];
		var tmp_query_values = [];

		for( var i in OBJ_VALS ){
			if( !OBJ_VALS.hasOwnProperty(i) ) continue;

			tmp_query_fields.push(i);
			tmp_query_questionmarks.push('?');
			if( typeof OBJ_VALS[i] == 'string' ){
				tmp_query_values.push( "'" + OBJ_VALS[i] + "'" );
			}else{
				tmp_query_values.push( OBJ_VALS[i] );
			}
		}

		tmp_query_fields = tmp_query_fields.join(',');
		tmp_query_questionmarks = tmp_query_questionmarks.join(', ');
		this.ExecuteQuery({ query: "INSERT INTO " + TABLENAME + " (" + tmp_query_fields + ") VALUES ("+ tmp_query_questionmarks + ")", Arguments: tmp_query_values });
	},


	createTable : function( TBL ){ // creates a table only if the table does not already exist in database
		//	mydb.createTable(
		//		{
		//			tableName: 'AddressBook',
		//			createQuery: "CREATE TABLE AddressBook (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT,email TEXT, age INTEGER)",
		//			callBack: function(){}
		//		}
		//	);

		var me = this ;
		if( !TBL.hasOwnProperty('callBack')){ TBL.callBack = function(){} }
		var isCreated = false;

		me.ExecuteQuery({
			query: "SELECT name FROM sqlite_master WHERE type='table' and name = ? " ,
			Arguments:[TBL.tableName],
			callBack: function(result){
				if( !result || !result.length ){
					me.ExecuteQuery({
						query: TBL.createQuery,
						callBack: function(){
							isCreated = true;
							TBL.callBack(isCreated);
						}
					});

				}else{ // table already exists
					TBL.callBack(isCreated);
					return ;
				}

			}
		});
	}
};

