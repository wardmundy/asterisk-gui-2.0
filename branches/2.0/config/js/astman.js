/*
 * Asterisk-GUI	- an Asterisk configuration interface
 *
 * Javascript functions for accessing manager over HTTP and Some UI components/functions used in AsteriskGUI.
 *
 * Copyright (C) 2006-2008, Digium, Inc.
 *
 * Mark Spencer <markster@digium.com>
 * Pari Nannapaneni <pari@digium.com>
 *
 * See http://www.asterisk.org for more information about
 * the Asterisk project. Please do not directly contact
 * any of the maintainers of this project for assistance;
 * the project provides a web site, mailing lists and IRC
 * channels for your use.
 *
 * This program is free software, distributed under the terms of
 * the GNU General Public License Version 2. See the LICENSE file
 * at the top of the source tree.
 *
 */

_$ = function(x){
	if ( typeof x != 'string' ){ return null ;}
	if(document.getElementById(x)){
		return document.getElementById(x); 
	}
	return null;
};

// Some custom methods to Array Objects
	Array.prototype.replaceAB = function(a, b) { // return new array with all instances of a replaced with b
		var x =[];
		for(var i=0, j = this.length ; i < j; i++ ){
			if( this[i] === a ){
				x.push(b);
			}else{
				x.push(this[i]);
			}
		}
		return x;
	};

	Array.prototype.contains = function(str) {
		for(var i=0, j = this.length ; i < j; i++ ){
			if( this[i] === str )return true;
		}
		return false;
	};

	Array.prototype.containsLike = function(str) {
		return this.indexOfLike(str) != -1;
	};
	
	Array.prototype.each = function(iterator) {
		for(var i=0 , j = this.length; i < j ; i++ ){
			iterator(this[i] , i);
		}
	};

	Array.prototype.forEach = function(iterator) { // call a function on each element and update the element with the returned value
		for(var i=0 , j = this.length; i < j ; i++ ){
			this[i] = iterator(this[i] , i);
		}
	};
	
	Array.prototype.firstAvailable = function(start) {
		if(!start){ start = 1; }else{ start = Number( start ); }
		if(!this.length){return start;}
		for(var y=0, x=[] ; y< this.length; y++){ x.push( Number(this[y]) ); } // 'this' can also be an array of number strings
		var i=0;
		while( i < 1 ){
			if( x.contains(start) ){ start++; }else{ return start; }
		}
	};

	Array.prototype.removeFirst = function(){ // opposite of push - removes the first element of the array
		this.splice(0,1);
	};
	
	if(!Array.indexOf){
		Array.prototype.indexOf = function(a){
			for(var i=0; i<this.length; i++){
				if( this[i] === a ){
					return i;
				}
			}
			return -1;
		}
	}

	Array.prototype.indexOfLike = function( searchString ){
		if(!searchString.length){ return -1; }
		for(var i=0; i < this.length; i++ ){ if( this[i].beginsWith(searchString) ){ return i ; } }
		return -1 ;
	};

	Array.prototype.lastIndexOfLike = function( searchString ){
		var lastindex = -1;
		if(!searchString.length){ return lastindex; }
		for(var i=0; i < this.length; i++ ){ if( this[i].beginsWith(searchString) ){ lastindex = i; } }
		return lastindex ;
	};

	Array.prototype.push_IfNotPresent = function( a ){
		if(!this.contains(a)) this.push(a);
	};
	
	Array.prototype.sortNumbers = function() {
		return this.sort(function(a,b){return a - b});
	};
	
	Array.prototype.withOut = function(e) {
		var x =[];
		if( typeof e == 'string' || typeof e == 'number' ){
			var y = [e];
		}else if( e instanceof Array ){
			var y = e;
		}else{
			return this;
		}

		for( var a =0 ; a < y.length ; a++ ){
			var b = y[a];
			for( var i=0, j=this.length ; i < j ; i++ ){
				if( !(this[i] === b) && !y.contains(this[i]) && !x.contains(this[i]) ){
					x.push(this[i]);
				}
			}
		}

		return x ;
	};

// String Manipulation, and other custom methods for String Objects
	String.prototype.addZero = function(){
		return ( Number(this) < 10)? "0" + this : this;
	};

	String.prototype.afterChar = function(k){
		if(k.length > 1){ alert('String.afterChar() should be used with a single character'); return null;}
		var v = this.indexOf(k);
		if( v == -1){ return ''; }
		return this.substring(v+1);
	};

	String.prototype.afterStr = function(x){
		if( !this.contains(x) ){ return ''; }
		if(x.length == 1){ return this.afterChar(x); }
		var pos = this.indexOf(x) + x.length ;
		return this.substr(pos);
	};

	String.prototype.beforeChar = function(k){
		if(k.length > 1){ 
			alert('String.beforeChar() should be used with a single character');
			return null;
		}
		var v = this.indexOf(k);
		if( v == -1){ return ''; }
		return this.substring(0,v);
	};

	String.prototype.beforeStr = function(x){
		var r = this.afterStr(x);
		return this.withOut(x+r);
	};

	String.prototype.beginsWith = function(a){
		return this.length>=a.length && this.substring(0,a.length)==a
	};

	String.prototype.betweenXY = function(X,Y){
		if(X.length > 1 || Y.length > 1){ alert('String.betweenXY() accepts single character arguments'); return null;}
		var t = this.afterChar(X);
		return t.beforeChar(Y);
	};

	String.prototype.bold_X = function(x){
		if(x==''){return this ;}
		var position = this.toLowerCase().indexOf( x.toLowerCase() ) ;
		if (position == -1){ return this; }
		var c = this.substr( position , x.length );
		return  this.replace( c, "<B>" + c + "</B>" , "" );
	};
	
	String.prototype.camelize = function(){
	    var parts = this.split(' '), len = parts.length;
		var camelized = '';
	    for (var i = 0; i < len; i++)
	      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1) + ' ';
	    return camelized;
	};

	String.prototype.capitalizeFirstChar = function() {
		return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
	};

	String.prototype.contains=function(a){
		return this.indexOf(a)!=-1;
	};

	String.prototype.endsWith=function(a){
		return this.length >= a.length && this.substring(this.length-a.length)==a
	};

	String.prototype.escapeHTML = function() {
		var a = document.createTextNode(this);
		var b = document.createElement('div');
		b.appendChild(a);
		return b.innerHTML;
	};

	String.prototype.isAstTrue = function () {
		return ( this == 'yes' || this == 'true' || this == 'y' || this == 't' || this == '1' || this == 'on' ) ? true : false;
	};

	String.prototype.getNoOp = function(){
		return ( this.toLowerCase().indexOf('noop(') == -1 ) ? '' : this.betweenXY('(',')') ; // todo: handle multiple ')'s
	};

	String.prototype.guiMetaData = function(){
		return this + ' ; GUI metadata';
	};

	String.prototype.isValueInBetween = function (a,b) {
		a = Number(a);
		b = Number(b);
		var c = Number(this) , a1 = Math.min(a,b) , b1 = Math.max(a,b);
		return ( c >= a1 && c <= b1 ) ? true : false ;
	};

	String.prototype.lChop = function(c){ // chop a string from the beginning of the string
		if(this.beginsWith(c)){
			return this.substr(c.length);
		}
		return this;
	};

	String.prototype.rChop = function(c){ // chop a string from the end of the string
		if( this.indexOf(c) == -1 || !this.endsWith(c) ){
			return String(this); //actually we should be doing 'return this;' but for some reason firebug is reporting the returned string as an object
		}
		return this.substr( 0, this.length - c.length);
	};

	String.prototype.replaceXY = function(X,Y){
		return this.split(X).join(Y);
	};

	String.prototype.strip = function(){
		try {
			return this.replace(/^\s+|\s+$/g, "");
		} catch(e) {
			return s;
		}
	};

	String.prototype.times = function(a){
		return ( a < 1 ) ? '' : new Array(a+1).join(this);
	};

	String.prototype.stripTags = function() {
		return this.replace(/<\/?[^>]+>/gi, '');
	}

	String.prototype.trim = function(){ // alias to strip
		return this.strip();
	};

	String.prototype.withOut = function(k){
		return this.split(k).join('');
	};


Number.prototype.addZero = function(){
	return ( this < 10)? "0" + String(this) : String(this);
};

Number.prototype.isValueInBetween = function (a,b) {
	a = Number(a);
	b = Number(b);
	var a1 = Math.min(a,b) , b1 = Math.max(a,b);
	return ( this >= a1 && this <= b1 ) ? true : false ;
};

Number.prototype.guiMetaData = function(){
	return String(this) + ' ; GUI metadata';
};

// The ASTGUI Object - global varibles and various core GUI component functions
var ASTGUI = {
	includeContexts: [], // updated below

	globals: {
		providerUrl: './js/providers.js', // ASTGUI.globals.providerUrl
		firmwareVersionUrl: 'https://gui-dl.digium.com/aa50/fw_version.js', // ASTGUI.globals.firmwareVersionUrl
		appname : 'Asterisk GUI',
		lang : 'en',
		GUI_DB : 'astgui', // name of the ASTDB database used by GUI -- ASTGUI.globals.GUI_DB
		msg_notLoggedIn: 'Message: Authentication Required',
		configfile : 'guipreferences.conf', // will be created if the file does not exist , ASTGUI.globals.configfile
		hwcfgFile: 'gui_confighw.conf', // file to store configured hardware information
		zaptelIncludeFile: 'zaptel_guiRead.conf', // file that will be used to read zapte.conf, ASTGUI.globals.zaptelIncludeFile
		pingInterval : 5000,
		app_factoryReset : '/bin/reset_config', // ASTGUI.globals.app_factoryReset
		fnf : 'ERROR:FNF',
		obcidstr : 'GLOBAL_OUTBOUNDCID', // ASTGUI.globals.obcidstr
		obcidUsrPrefix : 'CID_', // ASTGUI.globals.obcidUsrPrefix
		sbcid_1 : 's,1,ExecIf($[ "${CALLERID(num)}"="" ],SetCallerPres,unavailable)', // ASTGUI.globals.sbcid_1
		sbcid_2 : 's,2,ExecIf($[ "${CALLERID(num)}"="" ],Set,CALLERID(all)=unknown <0000000>)',
		timeservers: [ 'north-america.pool.ntp.org', 'asia.pool.ntp.org', 'europe.pool.ntp.org', 'oceania.pool.ntp.org', 'south-america.pool.ntp.org' ],
		version : '2.0' // gui version
	},

	contexts: {
		guitools : 'asterisk_guitools', // gui tools context
		dialtrunks : 'trunkdial-failover-0.3', // trunkdial macro with failback trunk and setcid, ASTGUI.contexts.dialtrunks
		CONFERENCES : 'conferences', // ASTGUI.contexts.CONFERENCES
		QUEUES : 'queues', //ASTGUI.contexts.QUEUES
		TrunkDIDPrefix : 'DID_', // context for trunks -  - ASTGUI.contexts.TrunkDIDPrefix 
		TrunkDefaultSuffix : '_default', // ASTGUI.contexts.TrunkDefaultSuffix - to create 'DID_trunk_default' that will be included in [DID_trunk]
		RingGroupPrefix: 'ringroups-custom-', // ASTGUI.contexts.RingGroupPrefix 
		RingGroupExtensions: 'ringgroups', // ASTGUI.contexts.RingGroupExtensions
		TimeBasedRulePrefix: 'timebasedrule-custom-', // ASTGUI.contexts.TimeBasedRulePrefix 
		TimeIntervalPrefix: 'timeinterval_', // ASTGUI.contexts.TimeIntervalPrefix
		VoiceMenuPrefix: 'voicemenu-custom-', // ASTGUI.contexts.VoiceMenuPrefix
		VoiceMenuExtensions: 'voicemenus', // ASTGUI.contexts.VoiceMenuExtensions
		VoiceMailGroups: 'voicemailgroups', // ASTGUI.contexts.VoiceMailGroups
		Directory: 'directory', // ASTGUI.contexts.Directory
		CallingRulePrefix : 'CallingRule_', // context for calling rules being with - ASTGUI.contexts.CallingRulePrefix 
		CallingPlanPrefix: 'DLPN_', // context for DialPlans -- ASTGUI.contexts.CallingPlanPrefix
		mohdirPrefix : 'guimohdir_' // ASTGUI.contexts.mohdirPrefix
		// music on hold directories created by gui will have this prefix
		// also post_mappings definitions in http.conf will have this name
	},

	errorCodes:{
		'AG101':'Aborting Upload : Action not defined for upload Form <BR>' + 
			'Please set the Form action in the parent page via onUploadForm_beforeUploading()',
		'AG102':'Disabling all Upload forms in the gui: <BR>' +
			'Either post_mappings or post_mappings->uploads is not defined in http.conf',
		'AG150':' SyncActions being used for more than 5 actions'
	},

	ASTDB:{
		updateKey : function( k ){ // ASTGUI.ASTDB.updateKey( { dbname: 'astgui', key : 'keyname', keyvalue : 'keyvalue' } );
			// k = { dbname: 'astgui', key : 'keyname', keyvalue : 'keyvalue' } // dbname is optional, defaults to ASTGUI.globals.GUI_DB
			if( !k.hasOwnProperty('dbname') ){
				k.dbname = ASTGUI.globals.GUI_DB ;
			}

			var s = ASTGUI.cliCommand('database put '+ k.dbname + ' ' + k.key + ' ' + k.keyvalue );
			if(s.contains('successfully')) return true;
			return false;
		},

		deleteKey : function( k ){ // ASTGUI.ASTDB.deleteKey( { dbname: 'astgui', key : 'keyname' } );
			// k = { dbname: 'astgui', key : 'keyname' } // dbname is optional, defaults to ASTGUI.globals.GUI_DB
			if( !k.hasOwnProperty('dbname') ){
				k.dbname = ASTGUI.globals.GUI_DB ;
			}

			var s = ASTGUI.cliCommand('database del '+ k.dbname + ' ' + k.key);
			if(s.contains('entry removed')) return true;
			return false;
		},


		getKey : function(k){  // ASTGUI.ASTDB.getKey( { dbname: 'astgui', key : 'keyname' } );
			// k = { dbname: 'astgui', key : 'keyname' } // dbname is optional, defaults to ASTGUI.globals.GUI_DB
			if( !k.hasOwnProperty('dbname') ){
				k.dbname = ASTGUI.globals.GUI_DB ;
			}

			var s = ASTGUI.cliCommand('database get '+ k.dbname + ' ' + k.key);
			if( s.contains('entry not found')) return null;
			var op = ASTGUI.parseCLIResponse( s );
			op = op.trim();
			op = op.withOut('Value:')
			return op.trim();
		},

		getAllKeys : function(k){ // ASTGUI.ASTDB.getAllKeys( { dbname: 'astgui' } );
			// k = { dbname: 'astgui' } // dbname is optional, defaults to ASTGUI.globals.GUI_DB
			if( !k.hasOwnProperty('dbname') ){
				k.dbname = ASTGUI.globals.GUI_DB ;
			}

			var db_keys = {};
			var tmp_dbpath = '/' + k.dbname + '/' ;
			var s = ASTGUI.cliCommand('database show '+ k.dbname);

			if(s.contains('entry not found')) return null;
			var op = ASTGUI.parseCLIResponse( s );
			if( op.trim() == ''){ return {}; }

			var tmp_lines = op.trim().split('\n');
			tmp_lines.each( function(this_line){
				var this_line = this_line.withOut(tmp_dbpath);
				var this_key = this_line.beforeChar(':').trim();
				var this_keyVal = this_line.afterChar(':').trim();
				db_keys[ this_key ] =  this_keyVal ;
			});

			return db_keys;
		}
	},

	checkRequiredFields: function( fields ){
		for(var g=0; g < fields.length ; g++ ){
			var field = fields[g];
			if(typeof field =='string'){
				field = _$(field); 
			}
			var required = $(field).attr('required');
			if( required && required.isAstTrue() ){
				var x = field.value.trim() ;
				var pcn = ( field.className ) ? field.className : '' ;
				if( !x ){
					ASTGUI.feedback( { msg:'Required Field', showfor:2 } );
					field.className = 'inputValidationFailed';
					setTimeout( function(){ field.className = pcn ; } , 4000 );
					try{ field.focus(); }catch(e){}
					return false;
				}
			}
		}
		return true;
	},

	cliCommand : function(cmd) { // ASTGUI.cliCommand(cmd);
		ASTGUI.debugLog("Executing manager command : '" + cmd + "'" , 'manager');
		return makeSyncRequest ( { action :'command', command: cmd } );
	},

	getUser_DeviceStatus : function( usr ){ // ASTGUI.getUser_DeviceStatus(usr) 
		var t = makeSyncRequest({ action :'ExtensionState', Exten: usr }) ;
		if( t.contains('Status: 0') ) return 'F' ; // No Device is Busy/InUse
		if( t.contains('Status: 1') ) return 'B' ; // 1 or more devices InUse
		if( t.contains('Status: 2') ) return 'B' ; // All Devices Busy
		if( t.contains('Status: 4') ) return 'U' ; // All Devices Unavailable/Unregistered
		if( t.contains('Status: 8') ) return 'R' ; // All Devices Ringing
		if( t.contains('Status: 16') ) return 'H' ; // All Devices OnHold
		return null;
	},

	getUser_DeviceStatus_Image : function( usr ){ // ASTGUI.getUser_DeviceStatus_Image(usr) 
		var s =  this.getUser_DeviceStatus(usr) ;
		switch(s){
			case 'F': // No Device is Busy/InUse
				return "<img src='images/status_green.png' border=0>";
				break ;
			case 'B': // Busy
				return "<img src='images/status_red.png' border=0>";
				break ;
			case 'U': // UnAvailable
				return "<img src='images/status_gray.png' border=0>";
				break ;
			case 'R': // Ringing
				return "<img src='images/status_orange.png' border=0>";
				break ;
			case 'H': // Hold
				return "<img src='images/status_yellow.png' border=0>";
				break ;
			default :
				return "<img src='images/status_gray.png' border=0>";
				break ;
		}
	},

	mailboxCount : function(mbox){ // ASTGUI.mailboxCount(mox) ; --> returns the number of New/Old Messages in mbox's mailbox
		if(!mbox.contains('@')){ mbox = mbox + '@default' ; }
		var t = makeSyncRequest ( { action :'MailboxCount', Mailbox: mbox } );
		var tr = { count_new:0 , count_old : 0 };
		try{
			var lines = t.split('\n');
			lines.each(function( this_line){
				if(!this_line.contains('Messages:') ) return;
				this_line = this_line.trim();
				if( this_line.contains('NewMessages:') ){
					tr.count_new = Number(this_line.afterChar(':').trim());
				}
				if( this_line.contains('OldMessages:') ){
					tr.count_old = Number(this_line.afterChar(':').trim());
				}
			});
		}finally{
			return tr;
		}
	},

	doTransfer : function(from, to) {
		ASTGUI.debugLog("About to transfer " + from + " to " + to, 'manager');
		return makeSyncRequest ( { action :'redirect', channel :from, exten :to, context :'default', priority :'1' } );
	},

	doHangup : function(chan) {
		ASTGUI.debugLog("Executing hangup on channel : '" + chan + "'" , 'manager');
		return makeSyncRequest ( { action :'hangup', channel: chan } );
	},

	cookies: {
		getCookie: function(x){ // ASTGUI.cookies.getCookie('username')
			var ck = top.document.cookie; // mansession_id="6f3fadcb"; username=admin
			if( ck.indexOf( x + '=' ) == -1 ){
				return '';
			}
			var cookies = ck.split(';');
			for(var y=0; y < cookies.length; y++){
				cookies[y] = cookies[y].strip();
				if( cookies[y].beginsWith(x +'=') ){
					return cookies[y].split( x + '=' )[1] ;
				}
			}
			return '';
		},

		setCookie: function(x , y){ // ASTGUI.cookies.setCookie( 'something' , 'valueofSomething' );
			var tmp = x + '=' + y + '; path = /' ;
			top.document.cookie = tmp;
		},

		clearCookies: function(){  // ASTGUI.cookies.clearCookies()
			top.document.cookie = '';
		}
	},

	cloneObject: function(a){ // ASTGUI.cloneObject(obj)
		if(ASTGUI.isArray(a)){
			return [].concat(a);
		}
		if( typeof a != 'object' ){
			return a;
		}
		var b = new ASTGUI.customObject ;
		for( var i in a ){
			if( a.hasOwnProperty(i) ){
				b[i] = ASTGUI.toCustomObject( a[i] );
			}
		}
		return b;
	},

	CODECSLIST: {
		getSelectedCodecs : function(el){ // ASTGUI.CODECSLIST.getSelectedCodecs(el);
			if ( typeof el == 'string'){ el = _$(el) ; }
			var s = [];
			el.CODECS_SELECTEDORDER.each(function(codec){
				var t = codec.trim();
				if(t != ''){ s.push(codec); }
			});
			return s.join(',') ;
		},

		populateCodecsList : function(el){ // ASTGUI.CODECSLIST.populateCodecsList(el);
		// create codecs check boxes inside el and bind events to each checkbox such that the selected codecs 
			var r =  'codecs_chkbx_class' + Math.round( 10000 * Math.random() );
			if ( typeof el == 'string'){ el = _$(el) ; }
			el.checkboxClass = r;
			el.CODECS_SELECTEDORDER = [];
			ASTGUI.domActions.populateCheckBoxes(el , parent.sessionData.listOfCodecs , r);
			$('.' + r).click(
				function() {
					if(this.checked){
						el.CODECS_SELECTEDORDER.push(this.value);
						return;
					}
					var t = el.CODECS_SELECTEDORDER.withOut(this.value);
					el.CODECS_SELECTEDORDER = t ;
					return ;
				}
			);
		},

		selectCodecs : function(el, codecs){ // ASTGUI.CODECSLIST.selectCodecs(el, codecs);
			// el is the element in which codec checkboxes are populated, codecs is the codecs string
			if ( typeof el == 'string'){ el = _$(el) ; }
			if( codecs == 'all' ){
				ASTGUI.domActions.CheckAll(el.checkboxClass);
				el.CODECS_SELECTEDORDER = ASTGUI.domActions.get_checked(el.checkboxClass);
			}else{
				if( codecs.trim() == '' ){
					el.CODECS_SELECTEDORDER = [] ;
				}else{
					el.CODECS_SELECTEDORDER = ( codecs.contains(',') ) ? codecs.split(',') : codecs;
				}
				ASTGUI.domActions.checkSelected( el.checkboxClass , el.CODECS_SELECTEDORDER ) ;
			}
		}
	},

	COMBOBOX: function (a,w){		// Usage - ASTGUI.COMBOBOX.call( element , OptionsArray, width(Optional)  );
		// this.comboDiv - the div element created
		// this.comboOptions - the array of options
		var e = this;
		var k = document.createElement('DIV');
		var continue_cleanup = true;

		var cleanupDiv = function(){
			var y = e;
			var sf = function(){
				if(!continue_cleanup) return;
				try{
					if(y.comboDiv){
						var q = y.comboDiv;
						q.parentNode.removeChild(q);
						delete y.comboDiv;
						ASTGUI.events.remove( y, 'blur' , cleanupDiv ) ;
						y.blur();
					}
				}catch(err){

				}
			};
			setTimeout( sf, 150 );
		};

		var creatediv = function(event){
			ASTGUI.events.add( e, 'blur' , cleanupDiv ) ;
			var u = e;
			var q = k.cloneNode(false);
			q.className = "comboMainDiv";
			if(w){ q.style.width = w; }
			u.comboDiv = q;
			var selectOption = function(event){
				continue_cleanup = false ;
				var f = ASTGUI.events.getTarget(event);
				u.value = f.getAttribute( 'actualvalue' );
				continue_cleanup = true ;
				cleanupDiv();
			};

			ASTGUI.events.add( q , 'click' , selectOption );
			q.style.display = 'none' ;
			document.body.appendChild(q);
			ASTGUI.domActions.alignBbelowA(u,q);
			updateDivAndShow.call(e);
		};
	
		var updateDivAndShow = function(){
			var t = e.comboDiv ;
			var srchStng = e.value.toLowerCase() ;
			var z = e.comboOptions ;
			var y ;
			var matched = 0 ;
	
			ASTGUI.domActions.removeAllChilds(t);
			for (var r =0; r < z.length; r++){
				if( z[r].toLowerCase().contains(srchStng) || srchStng == '' ){
					y = k.cloneNode(false);
					y.innerHTML = z[r].bold_X( srchStng );
					y.setAttribute( 'actualvalue', z[r] );
					t.appendChild(y);
					matched++;
				}
			}
			setTimeout( function(){ t.style.display = (matched) ? '' : 'none'; } , 20 );
		};

		e.comboOptions = a.sort();
		ASTGUI.events.add( e, 'focus' , creatediv ) ;
		ASTGUI.events.add( e, 'keyup' , updateDivAndShow ) ;
	},

	customObject : function(){
		// NOTE: use this as a constructor only,  EX: var something = new ASTGUI.customObject;
		//	eliminates the need of 'hasOwnProperty' to read this objects propeties, look for this objects prototype below.
	},

	toCustomObject : function(a){// if a is a native object returns an ASTGUI.customObject version of a
		if( ASTGUI.isArray(a) || a === null || typeof a =='number' || typeof a =='string' || typeof a =='boolean' || typeof a != 'object' ) return a;

		var b = new ASTGUI.customObject ;
		for( var i in a ){ if( a.hasOwnProperty(i) ){
			b[i] = ASTGUI.toCustomObject( a[i] );
		}}
		return b;
	},

	debugLog: function(msg, color){ // Ex:		ASTGUI.debugLog('Some debug message', 'get');
		if(!top.sessionData.DEBUG_MODE ){ return true; }

		if( typeof msg == 'object' ){
			msg = 'OBJECT : ' + ASTGUI.getObjectPropertiesAsString(msg) ;
		}

		if(!color){ color = '#324176'; }
		switch(color){
			case 'get':	// for getconfig and reading html files
				color = '#9A9A9A';
				break;
			case 'update': // for updateconfig messages
				color = '#CC0066';
				break;
			case 'manager': // for manager commands
				color = '#2B6C36';
				break;
			case 'system': // for system commands
				color = '#F47A00';
				break;
			case 'parse': // for logging parse errors
				color = '#4C9996';
				//msg = '<b>' + msg + '</b>' ;
				break;
		}
		var now = new Date();
		var h = now.getHours().addZero() + ':' + now.getMinutes().addZero() + ':' + now.getSeconds().addZero() ;
		if( top.sessionData.DEBUG_LOG.length > 250){
			top.sessionData.DEBUG_LOG = top.sessionData.DEBUG_LOG.slice(0,50);
		}
		top.sessionData.DEBUG_LOG.unshift( h + ' <font color='+ color +'>' + msg + '</font>' );
	},

	dialog : {
		defaultMessage : 'Loading ...',
		load_iframe : function(msg){
			top.alertframename = "alertiframe" ;
			top.alertmsg = msg ;
			var h,_hs;
			if( !top.document.getElementById(top.alertframename)){
				h= top.document.createElement("IFRAME");
				h.setAttribute("id", top.alertframename );
				h.setAttribute("ALLOWTRANSPARENCY", "true");
				_hs = h.style ;
				_hs.position="absolute";
				_hs.left= 0;
				_hs.top= 0;
				_hs.width= '100%';
				_hs.height= '100%';
				_hs.zIndex = 9999 ;
				h.src = "guialert.html" ;
				h.frameBorder="0";
				h.scrolling="no";
				_hs.filter='progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=90)';
				//h.style.MozOpacity = .90;
				top.document.body.appendChild(h);
			}else{
				top.document.getElementById( top.alertframename ).contentWindow.update( );
				top.document.getElementById( top.alertframename ).style.display = "";
			}
		},

		waitWhile : function(msg){ 
			top.alertmsgtype = 2 ;
			this.load_iframe(msg);
		},

		alertmsg : function(msg){ // Ex: ASTGUI.dialog.alertmsg('Some Alert Message');
			top.alertmsgtype = 1 ;
			this.load_iframe(msg);
		},

		hide : function(){
			try{
				top.document.getElementById( top.alertframename ).style.display = "none";
			} catch (err){ }
		},

		show : function(){
			try{
				top.document.getElementById( top.alertframename ).style.display = '';
			} catch (err){ }
		}
	},

	domActions: {
		alignBbelowA: function(a,b, offsetLeft, offsetTop ){
			if ( typeof a == 'string'){ a = _$(a) ; }
			if ( typeof b == 'string'){ b = _$(a) ; }
			b.style.position = 'absolute';
			var tmp_left = a.offsetLeft;
			var tmp_top = a.offsetTop + a.offsetHeight;
			var tmp_parent = a;
	
			while(tmp_parent.offsetParent != document.body){
				tmp_parent = tmp_parent.offsetParent;
				tmp_left += tmp_parent.offsetLeft;
				tmp_top += tmp_parent.offsetTop;
			}
			b.style.left = tmp_left + ( offsetLeft || 0 );
			b.style.top = tmp_top + (offsetTop || 1);
		},

		alignBontopofA: function(a,b){ // ASTGUI.domActions.alignBontopofA();
			try{
				if ( typeof a == 'string'){ a = _$(a) ; }
				if ( typeof b == 'string'){ b = _$(b) ; }
				ASTGUI.domActions.alignBbelowA(a,b);
				b.style.top = b.style.top - a.offsetHeight ;
			}catch(err){

			}
		},

		bindMenu: function(m,n){
			// assigns menu list element 'm' to button/span/element 'n' 
			// m will be aligned below n , 
			// and when n is clicked m will be displayed, and if clicked anywhere else on the document m will be 'hidden'
			if ( typeof m == 'string'){ m = _$(m) ; }
			if ( typeof n == 'string'){ n = _$(n) ; }
			ASTGUI.events.add( n , 'click' , function(b){
					(b||window.event).cancelBubble = true;
					ASTGUI.domActions.alignBbelowA(n, m);
					m.style.display = '';
					n.style.background ='#a8b6e5';
				}) ;
			ASTGUI.events.add( document , 'click' , function(){ n.style.background =''; m.style.display ='none' ;} ) ;
		},

		CheckAll: function(x){ // check all checkboxes of class x - ASTGUI.domActions.CheckAll();
			var y = $("." + x) ;
			for(var g=0, h = y.length; g < h; g++){
				y[g].checked = true;
			}
		},

		disableAllofClass: function(x){ // disable all fields of class x
			var y = $("." + x) ;
			for(var g=0, h = y.length; g < h; g++){
				y[g].disabled = true;
			}
		},

		checkIf_isAstTrue: function(el, str){ // ASTGUI.domActions.checkIf_isAstTrue(el,str);
			if ( typeof str != 'string' ){ return; }
			if ( typeof el == 'string' ){ el = _$(el); }
			el.checked = ( str.isAstTrue() ) ? true:false ;
		},

		checkSelected: function(x,y){ // ASTGUI.domActions.checkSelected( 'class', [val1,val2,...]);
			// x is class of checkboxes, y is an array of values, this functions checks a checkbox if it its value is present in array 'y'
			//try{
				var y_copy = ASTGUI.cloneObject(y);
				var chbs = $( "." + x ) ; //jquery selector
				for( var g=0, h = chbs.length; g < h  ; g++ ) {
					chbs[g].checked = ( y_copy.contains(chbs[g].value) ) ? true : false;
				}
			//}catch(err){ }
		},

		disableSelected: function(x,y){	// disable some fields (whose "values" (not names or ids) are in array y), of class x 
			// ASTGUI.domActions.disableSelected( 'class', [1,2] );
			var chbs = $( "." + x ) ; //jquery selector
			for( var g=0, h = chbs.length; g < h  ; g++ ) {
				chbs[g].disabled = ( y.contains(chbs[g].value) ) ? true : false ;
			}
		},

		clear_table: function(h){ // ASTGUI.domActions.clear_table($el)
			if ( typeof h == 'string'){ h = _$(h) ; }
			for( var i=0; i <  h.rows.length; ){ h.deleteRow(i); }
		},

		findPos: function (el){ // returns the 'el.left, el.top' in pixels of a given element
			if ( typeof el == 'string'){ el = _$(el) ; }
			var curleft = curtop = 0;
			if (el.offsetParent) {
				do {
					curleft += el.offsetLeft;
					curtop += el.offsetTop;
				} while (el = el.offsetParent);
			}
			return { cleft: curleft, ctop:curtop } ;
		},

		get_checked: function (x){ // returns an array of selected checkbox values  from a set of checkboxes of class x
			var chk = [] ;
			var y = $( "." + x ) ; //jquery selector
			for( var g=0, h = y.length; g < h  ; g++){
				if(y[g].checked){
					chk.push( y[g].value );
				}
			}
			return chk;
		},

		removeAllChilds: function(x){ // ASTGUI.domActions.removeAllChilds(el);
			if ( typeof x == 'string'){ x = _$(x) ; }
			while(x.firstChild){
				x.removeChild(x.firstChild);
			}
		},

		setTextbox_DefaultValue: function(el, defval){ // usage :: ASTGUI.domActions.setTextbox_DefaultValue(el, "Default Value") ;
			if ( typeof el == 'string'){ el = _$(el) ; }
			el.defaultValue = defval;
			el.value = defval;
			$(el).focus(
				function(){
					if( this.value == this.defaultValue ){
						this.value = '' ;
					};
				}
			);
			$(el).blur(
				function () {
					if( this.value == '' ){
						this.value = this.defaultValue ;
					}
				}
			);
		},

		tr_addCell: function(tr, nc){ // usage :: ASTGUI.domActions.tr_addCell( el, { html:'newCell Text' , align:'center', width:'20px' }  )
			var ih = nc.html; delete nc.html;
			var newcell = tr.insertCell( tr.cells.length );
			if( nc.id ){ newcell.id = nc.id ; delete nc.id; }
			newcell.innerHTML = ih;
			if( nc.onclickFunction && typeof nc.onclickFunction == "function" ){
				ASTGUI.events.add( newcell , 'click' , nc.onclickFunction ) ;
				$(newcell).css('cursor', 'pointer');
				delete nc.onclickFunction;
			}
			for( var k in nc){
				if( nc.hasOwnProperty(k) ){
					if(k.toLowerCase() == 'colspan'){
						newcell.colSpan = nc[k];
					}else{
						newcell[k] = nc[k];
					}
				}
			}

		},

		unCheckAll: function(x){ // uncheck all checkboxes of class x
			var y = $("." + x) ; //jquery selector
			for(var g=0, h = y.length; g < h; g++){
				y[g].checked = false;
			}
		},

		populateCheckBoxes: function( div, values, ofclass, withBR){ // ASTGUI.domActions.populateCheckBoxes(div, values, ofclass);
			// represent 'array values' OR 'Object values' as a list of checkboxes of class 'ofclass' as childnodes of element 'div'
			// Ex: values = { '1':'One', '1':'Two' } or values = [1,2]
			var c = {};
			if(ASTGUI.isArray(values)){
				values.each( function(tv){ c[tv] = tv; } );
			}else{
				c = values;
			}
			if ( typeof div == 'string'){ div = _$(div) ; }
			for(var d in c){
				if(c.hasOwnProperty(d)){
					var nbr = document.createElement( 'SPAN' ) ;
					var lbl = document.createElement( 'label' ) ;
						var ncbx = document.createElement('input') ;
							ncbx.type = 'checkbox' ;
							ncbx.value = d ;
							ncbx.id = Math.round(10000*Math.random()) + '_' + d ;
							ncbx.className = ofclass ;
						var span = document.createElement('SPAN') ;
						
						span.innerHTML = (withBR) ? c[d] + '&nbsp;<BR>' : c[d] + '&nbsp;' ;
						
					lbl.appendChild( ncbx ) ;
					lbl.appendChild( span ) ;
					//var tmp_span = document.createElement('SPAN') ; tmp_span.innerHTML = '&#173;'; //tmp_span.innerHTML = '&#173;';
					nbr.appendChild(lbl) ;
					div.appendChild( nbr ) ;
				}
			}
		},

		showHideByCheckBox: function(chk , el){ // ASTGUI.domActions.showHideByCheckBox (chk, el) ;
			if ( typeof chk == 'string'){ chk = _$(chk) ; }
			if ( typeof el == 'string'){ el = _$(el) ; }
			chk.updateStatus = function(){ el.style.display = (chk.checked)?'':'none'; } ;
			ASTGUI.events.add( chk, 'click' , chk.updateStatus );
		},

		showHideClassByCheckBox: function(chk , cLass , reverse_behaviour){ // ASTGUI.domActions.showHideClassByCheckBox(chk, cLass) ;
			if ( typeof chk == 'string'){ chk = _$(chk) ; }
			chk.updateStatus = function(){
				if(reverse_behaviour ){
					if(chk.checked){
						$('.'+cLass).hide();
					}else{
						$('.'+cLass).show();
					}
				}else{
					if(chk.checked){
						$('.'+cLass).show();
					}else{
						$('.'+cLass).hide();
					}
				}
			};
			ASTGUI.events.add( chk, 'click' , chk.updateStatus );
		},

		enableDisableByCheckBox: function(chk , el, reverse_behaviour) { // ASTGUI.domActions.enableDisableByCheckBox (chk, el) ;
			// this function can also use for radio boxes
			if ( typeof chk == 'string'){ chk = _$(chk) ; }
			if ( typeof el == 'string'){ el = _$(el) ; }
			if( ASTGUI.isArray(el) ){
				chk.updateStatus = function(){
					el.each( function(el_this){
						if ( typeof el_this == 'string'){ el_this = _$(el_this) ; }
						if(!reverse_behaviour){
							el_this.disabled = !(chk.checked);
						}else{
							el_this.disabled = chk.checked;
						}
					});
					
				};
			}else{
				if(!reverse_behaviour){
					chk.updateStatus = function(){ el.disabled = !(chk.checked) } ;
				}else{
					chk.updateStatus = function(){ el.disabled = chk.checked; } ;
				}
			}

			ASTGUI.events.add( chk, 'click' , chk.updateStatus );
		}
	},

	events: {
		getTarget: function(x){
			x = x || window.event;
			return x.target || x.srcElement;
		},
		add: function(a,b,c){ // a is element , b is event (string) , c is the function 
			if ( typeof a == 'string'){ a = _$(a) ; }
			if($.browser.msie){
				a.attachEvent('on'+b, c);
				return;
			}
			if(a.addEventListener){
				a.addEventListener(b, c, false);
				return;
			}
			a['on'+b] = c ;
		},
		remove: function(a,b,c){
			if ( typeof a == 'string'){ a = _$(a) ; }
			if($.browser.msie){
				a.detachEvent('on'+b, c);
				return;
			}
			if(a.removeEventListener){
				a.removeEventListener(b, c, false);
				return;
			}
			a['on'+b] = null ;
		}
	},

	ErrorLog: function( Code ){// Ex: ASTGUI.ErrorLog('AG102');
		if( Code.length <=5 && ASTGUI.errorCodes[Code] ){
			ASTGUI.debugLog( '<B>' + ASTGUI.errorCodes[Code] + '</B>' , '#990033' );
		}else{
			ASTGUI.debugLog( '<B>' + Code + '</B>' , '#990033' );
		}
	},

	feedback : function( fb ){
		// usage  ::  ASTGUI.feedback( { msg:'your message here', showfor:2, color:'#000000', bgcolor:'#FFFFFF' } );
		top.miscFunctions.setFeedback(fb);
	},

	generateGraph : function( DATA ){ // generates bar graph into table DATA.TBL for array DATA.VALS
		// ASTGUI.generateGraph( {TBL: 'DIV_Graph', VALS: gr_vals, HEIGHT: 150, WIDTH: 9 });
		// WIDTH is width of each cell
		var TBL = DATA.TBL;
		var VALS = DATA.VALS ;
		var HEIGHT = Number(DATA.HEIGHT) || 100 ;
		var WIDTH = DATA.WIDTH || 5 ;

		var table_ofHeight = function(h, color){
			h = Math.floor((HEIGHT * Number(h))/100) ;
			var uh = HEIGHT - h ;
			if(!color){ color = '#a8b6e5';}
			return "<TABLE cellpadding=0 cellspacing=0><TR><TD bgcolor='#FFFFFF' height=" + uh + " width=" + WIDTH + "></TD></TR>"
				+ "<TR><TD bgcolor='"+ color +"' height=" + h + " width=" + WIDTH + "></TD></TR></TABLE>" ;
		};

		if ( typeof TBL == 'string'){ TBL = _$(TBL); }
		ASTGUI.domActions.clear_table(TBL);
		var newRow = TBL.insertRow(-1);
		VALS.each( function( this_val ){
			var newcell = newRow.insertCell( newRow.cells.length );
			newcell.align = 'center' ;
			newcell.valign = 'bottom' ;
			newcell.width = WIDTH + 'px' ;
			newcell.height = HEIGHT ;
			var clr = ((newRow.cells.length)%2==1) ? '#a8b6e5' : '#dce5f6' ;
			newcell.innerHTML = table_ofHeight( this_val , clr );
		});
	},

	getFieldValue : function(el){ // ASTGUI.getFieldValue(el)
		if ( typeof el == 'string'){ el = _$(el) ; }
		switch(el.type){
			case 'text':
				return el.value.trim();
				break ;
			case 'checkbox':
				return (el.checked) ? 'yes':'no' ;
				break;
			case 'radio':
				return (el.checked) ? el.value : '' ;
				break;
			case 'select-one':
				return el.value ; //.trim()
				break;
			case 'textarea':
				return el.value.trim() ;
				break;
			case 'password':
				return el.value.trim() ;
				break;
			default:
				break;
		}
		return '';
	},

	getObjectPropertiesAsString : function(a){ // takes an object and returns all its properties, values as a string
		var ar = [];
		for(var d in a){
			if(!a.hasOwnProperty(d)){ continue; }

			if( typeof a[d] == 'object' ){
				if( ASTGUI.isArray(a[d]) ){
					ar.push(  d + ' : [' + a[d].join(',') + ']' );
				}else{
					ar.push(  d + ' : ' + ASTGUI.getObjectPropertiesAsString(a[d]) );
				}
			}else{
				ar.push(d + ' : '+ a[d]);
			}
		}
		return '{' + ar.join(' ,') + '}' ;
	},

	getTrunkStatus : function (registry , trunkname, ttype){ // ASTGUI.getTrunkStatus (registry, trunkname);
		/* registry should be == {
			iax2 : ASTGUI.parseCLIResponse( ASTGUI.cliCommand('iax2 show registry') ) ,
			sip : ASTGUI.parseCLIResponse( ASTGUI.cliCommand('sip show registry') )
		} ;
		*/
		// trunkname == trunkname as trunk_x 
		//var ttype = parent.astgui_managetrunks.misc.getTrunkType(trunkname) ;
		var this_IP = '';
		if(!ttype || ( ttype != 'sip' && ttype != 'iax' && ttype != 'providers' ) ){ return '--'; }
		if( ttype == 'providers' ){
			var uname = parent.sessionData.pbxinfo.trunks[ttype][trunkname]['username'];
			var host = parent.sessionData.pbxinfo.trunks[ttype][trunkname]['host'];
			ttype = parent.astgui_managetrunks.misc.getProviderTrunkType(trunkname); // find 'sip' or 'iax'
			if ( ttype != 'sip' && ttype != 'iax'){
				return '--';
			}
		}else{
			var uname = parent.sessionData.pbxinfo.trunks[ttype][trunkname]['username'];
			var host = parent.sessionData.pbxinfo.trunks[ttype][trunkname]['host'];
		}
		if( !uname) {return '';}

		(function(){
			if(ttype=='iax'){var a ='iax2';}
			if(ttype=='sip'){var a ='sip';}
			var t = ASTGUI.cliCommand(a + ' show peer ' + trunkname) ;
			t = ASTGUI.parseCLIResponse( t );
			var IP = '';
			var s = t.split('\n');
			for(var i=0; i < s.length; i++ ){
				var line = s[i];
				if(line.contains('Addr->IP') ){ // if line is  'Addr->IP     : 68.62.219.197 Port 5060'
					var tmp = line.afterChar(':'); // tmp = '68.62.219.197 Port 5060' ;
					var tmp2 = tmp.split(' Port ');
					IP = tmp2.join(':');
					IP = IP.trim();
					this_IP = IP;
					return;
				}
			}
		})();

		if(ttype=='iax'){
			var lines = registry.iax2.split('\n');
		}else if(ttype=='sip'){
			var lines = registry.sip.split('\n');
		}

		//var uname_lc = uname.toLowerCase();
		// TODO: come up with a better alternative than this
		// cli output of 'sip show registry' shows only a part of long usernames
		var uname_lc = uname.toLowerCase().substr(0,12);

		for(var i = 0; i < lines.length; i++) {
			var line = lines[i].trim().toLowerCase();
			if (!line || line.beginsWith('host') ){ continue; }
			if( ( line.beginsWith(host+':') || ( this_IP && line.beginsWith(this_IP + ' ') ) )  && line.contains( ' ' + uname_lc + ' ' ) ){
				if( line.contains(' registered') ){
					return '<font color=green>Registered</font>' ;
				}else if( line.contains('auth. sent') ){
					return '<font color=red>Waiting for Authentication</font>';
				}else if( line.contains('request sent') ){
					return '<font color=red>Request Sent</font>';
				}else if( line.contains('rejected') ){
					return '<font color=red>Rejected</font>';
				}else if( line.contains('unregistered') ){
					return '<font color=red>Unregistered</font>';
				}else{
					return '<font color=red>Unregistered</font>';
				}
			}
		}
		return '<font color=red>Unregistered</font>';
	},

	parseGETparam : function(url_string, getparam ){ // ASTGUI.parseGETparam( url , 'EXTENSION_EDIT');
		// parse a URL string and return the value of a GET parameter
		// url can be in '....html?EXTENSION_EDIT=XXXX&YYYYYYY...' or '....html?EXTENSION_EDIT=XXXX'
		var t = getparam + '=' ;
		if( url_string.contains(t) ){
			var g = url_string.afterStr(t);
			return g.contains('&') ? g.beforeChar('&') : g ;
		}
		return '';
	},

	hideDrag : function(event){
		// Use this as a Cancel Button event, DONOT use this for hiding the div after save()/update(),  use the '$().hideWithBg()' instead
		var et = ASTGUI.events.getTarget(event) ;
		while( et.nodeName.toUpperCase() != 'DIV' ){ et = et.parentNode ; }
		et.style.display = 'none';
		ASTGUI.feedback( { msg:'Changes cancelled !', showfor:2,  color:'#32633d' } );
		try{
			et.ownerDocument.getElementById('bg_transparent').style.display ='none';
		}catch(err){}
	},

	isNull : function(a){
		return a===null
	},

	isArray: function(a){ //	ASTGUI.isArray(a) ;
		return a instanceof Array || ( a!= null && typeof a=="object" && typeof a.push == "function" && typeof a.concat == "function" )
	},

	loadHTML: function(u){ // loads URL 'u' in synchronus mode. note that url 'u' is restricted by same origin policy
		var r =  Math.round(10000*Math.random());
		var s = $.ajax({ url: u + '?r=' + r , async: false });
		return s.responseText;
	},

	listSystemFiles : function( dir , cb ){
		this.systemCmd( this.scripts.ListFiles + ' ' +  dir , function(){
			var op = ASTGUI.loadHTML( ASTGUI.paths.output_SysInfo );
			var tmp_files = op.split('\n');
			var files = [];
			for( var i =0 ; i < tmp_files.length ; i++){
				if( typeof tmp_files[i] == "undefined" ){ continue; }
				tmp_files[i] = tmp_files[i].trim();
				if( tmp_files[i] == "" ){ continue; }
				files.push(tmp_files[i]);
			}
			cb(files);
		});
	},

	miscFunctions: {
		getChunksFromManagerOutput : function( op , usf){ // ASTGUI.miscFunctions.getChunksFromManagerOutput( output_str ) ;
			var tr_Array = [];
			var tmp_chunk = (usf) ? {} : [] ;
			var count = 0;
			var tmp_lines = op.split('\n');
			if( tmp_lines[0].contains('Response: ') ) tmp_lines.removeFirst();
			if( tmp_lines[0].contains('Message: ') ) tmp_lines.removeFirst();

			for( var r = 0; r < tmp_lines.length ; r++ ){
				var this_line = tmp_lines[r];
				if( this_line.trim() == '' ){
					if( !count ){ continue; }
					tr_Array.push(tmp_chunk);
					tmp_chunk = (usf) ? {} : [] ;
					count = 0;
					continue;
				}

				if( !this_line.contains(': ') ){ continue;  }

				if( usf ){
					tmp_chunk[ this_line.beforeStr(': ').trim() ] = this_line.afterStr(': ').trim() ;
				}else{
					tmp_chunk.push(this_line) ;
				}
				count++ ;
			}

			return tr_Array ;
		},


		createConfig : function( fileName, callback){ // ASTGUI.miscFunctions.createConfig( 'filaName', function(){ } ) ;
			if( parent.sessionData.PLATFORM.isAST_1_6 ){
				var s = $.ajax({ url: ASTGUI.paths.rawman+'?action=createconfig&filename='+ fileName , async: false }).responseText;
				callback();
			}else{
				ASTGUI.systemCmd( 'touch ' + ASTGUI.paths.asteriskConfig + fileName, callback );
			}
		},

		ArrayContains : function(arr, str){ // ASTGUI.miscFunctions.ArrayContains(arr, str )
			// There is already an Array.prototype function for this
			// but IE is going crazy when using the prototype method on a parent window array
			for(var i=0, j = arr.length ; i < j; i++ ){
				if( arr[i] === str ) return true;
			}
			return false;
		},
			
		moveUpDown_In_context: function(context, line , updown , cbf ){ 	// ASTGUI.miscFunctions.moveUpDown_In_context( ct , line , bool , cbf ) // bool = 0 for Down , 1 for Up 
			updown = Number(updown);
			var t = context2json({ filename:'extensions.conf' , context : context , usf: 0 });
	
			if( !t.contains(line) ){ // Could not find the rule in this context.
				cbf(t);
			}
	
			for( var ti = 0 ; ti < t.length ; ti++ ){
				if( t[ti] == line ){
					var tmp_a = (updown) ? t[ ti - 1 ] : t[ ti + 1 ] ;
					t[ti] = tmp_a ;
					if( updown == 1 ){ // move up
						t[ti-1] = line ;
					}else{ // move down
						t[ti+1] = line ;
					}
					break;
				}
			}

			ASTGUI.miscFunctions.empty_context({ filename:'extensions.conf', context : context, cb : function(){
				var x = new listOfActions('extensions.conf');
				t.each(function( this_line ){
					x.new_action('append', context , this_line.beforeChar('=') ,  this_line.afterChar('=') );
				});
				x.callActions( function(){
					cbf(t);
				});
			}});
		},

		empty_context: function( ct ){ // ASTGUI.miscFunctions.empty_context({ filename:'somefile.conf', context : 'context_x', cb : fn })
			if( parent.sessionData.PLATFORM.isAST_1_6 ){
				var u = new listOfSynActions(ct.filename);
				u.new_action('emptycat', ct.context , '', '' ) ;
				u.callActions();
				ct.cb();
				return;
			}else{
				var sel_cxt = context2json({ filename: ct.filename , context : ct.context , usf:0 });
				var x = new listOfActions(ct.filename);
				sel_cxt.each(function(line){
					var var_name = line.beforeChar('=');
					var var_value = line.afterChar('=');
					x.new_action('delete', ct.context , var_name, '', var_value);
				});
				x.callActions(ct.cb);
			}
		},

		delete_LinesLike: function( ct ){
			// ASTGUI.miscFunctions.delete_LinesLike({ context_name : 'voicemailgroups' , beginsWithArr: ['exten=6050,'] , filename: 'extensions.conf', hasThisString:'somestring', cb:function(){} });
			var sel_cxt = context2json({ filename: ct.filename, context : ct.context_name , usf:0 });
			if ( typeof ct.beginsWithArr == 'string' ){
				ct.beginsWithArr = [ct.beginsWithArr];
			}

			var lines_to_delete = [];
				sel_cxt.each( function( line ){
					ct.beginsWithArr.each( function( this_beginsWithStr ){
						if( ct.hasThisString ){
							if( line.beginsWith( this_beginsWithStr ) && line.contains( ct.hasThisString) ){
								lines_to_delete.push( line );
							}
						}else{
							if( line.beginsWith( this_beginsWithStr ) ){
								lines_to_delete.push( line );
							}
						}
					});
				});

			var x = new listOfActions(ct.filename);
			lines_to_delete.each( function(line){
				var var_name = line.beforeChar('=');
				var var_value = line.afterChar('=');
				x.new_action('delete', ct.context_name , var_name, '', var_value);
			});

			x.callActions(ct.cb);
		},

		chanStringToArray: function(chs){ // ASTGUI.miscFunctions.chanStringToArray();
			// expects chs as '5' or '5-8' or '5,6,7,8' and returns [5] or [5,6,7,8]
			if ( !chs ) return [];
			if ( typeof chs != 'string') chs = String(chs) ;
			chs = chs.trim();
			var tr = [];

			if( chs.contains(',') ){
				var s = chs.split(',');
				tr = tr.concat(s);
				tr.forEach( function(u){ return String(u); } );
				return tr;
			}

			if( chs.contains('-') ){
				var a = Number( chs.beforeChar('-') );
				var b = Number( chs.afterChar('-') );
				for( var i=a; i <= b ; i++ ){
					tr.push( String(i) ) ;
				}
				return tr;
			}

			return [chs];
		},

		alertIfRangeisNotdefined: function(a , b, for_what){ // ASTGUI.miscFunctions.alertIfRangeisNotdefined();
			if(!a || !b){return true;}
			if( !parent.sessionData.GUI_PREFERENCES.getProperty(a) || !parent.sessionData.GUI_PREFERENCES.getProperty(b) ){
				ASTGUI.dialog.alertmsg("You do not have an extension range defined for '"+ for_what +"'. Please define your <i>Extension Preferences</I> from the 'Options' panel");
				return false;
			}
			return true;
		},

		isExtensionInRange: function(ext,a,b){ // ASTGUI.miscFunctions.isExtensionInRange('6000','ue_start','ue_end') ;
			var v = parent.sessionData.GUI_PREFERENCES.getProperty(a) ;
			var w = parent.sessionData.GUI_PREFERENCES.getProperty(b) ;
			if( !v || !w ){
				return true;
			}
			return ext.isValueInBetween(v, w);
		},

		AMPM_to_asteriskTime: function(ampmTime){ // takes ampmTime as '12:15 AM' or '11:45 PM' and returns '00:15' or '23:45'
			//ASTGUI.miscFunctions.AMPM_to_asteriskTime('12:15 AM');
			if( ampmTime.endsWith(' PM') ){
				var a = ampmTime.withOut(' PM');
				var tmp = a.split(':') ;
				var hour = Number(tmp[0]);
				return (hour == 12) ? hour + ':' + tmp[1] : ( hour + 12 ) + ':' + tmp[1] ;
			}

			if( ampmTime.endsWith(' AM') ){
				var a = ampmTime.withOut(' AM');
				var tmp = a.split(':') ;
				var hour = Number(tmp[0]);
				return ( hour == 12 ) ? '00:' + tmp[1]  : tmp[0] + ':' + tmp[1] ;
			}
			return '';
		},
		
		asteriskTime_to_AMPM: function(atime){ // takes atime as '00:15' or '23:45' and returns '12:15 AM' or '11:45PM'
			//ASTGUI.miscFunctions.asteriskTime_to_AMPM('23:15');
			var hour = atime.split(':')[0];
			var mins = atime.split(':')[1];
			if( hour == '00' ){
				return '12:' + mins + ' AM';
			}
			if( Number(hour) < '12' ){
				return hour + ':' + mins + ' AM';
			}
			if( hour == '12' ){
				return hour + ':' + mins + ' PM';
			}
			if( Number(hour) > 12 ){
				return (Number(hour)-12).addZero() + ':' + mins + ' PM';
			}
			return '';
		},

		GotoIftime_in_humanReadable: function( gotoiftime_str ){ 
			//ASTGUI.miscFunctions.GotoIftime_in_humanReadable( '08:00-17:00|mon-fri|*|*' ) ; // returns a human readable form as ' 8 AM to 5 PM on Monday through Friday'
			var WEEKDAYS = {mon: 'Monday', tue: 'Tuesdays', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat:'Saturday', sun:'Sunday'};

			var PIECES = gotoiftime_str.split('|') ;
			var toreturn = [];
			if( PIECES[0] != '*' ){
				toreturn.push( ASTGUI.miscFunctions.asteriskTime_to_AMPM(PIECES[0].split('-')[0]) + ' to ' +  ASTGUI.miscFunctions.asteriskTime_to_AMPM(PIECES[0].split('-')[1]) );
			}

			if( PIECES[2] == '*' && PIECES[3] == '*' ){ // by week days
				if( PIECES[1].contains('-') ){ // range of week days
					toreturn.push( 'on ' + WEEKDAYS[PIECES[1].split('-')[0]] + ' through ' + WEEKDAYS[PIECES[1].split('-')[1]]  );
				}else{
					toreturn.push( 'on ' + WEEKDAYS[PIECES[1]] + 's' );
				}

				return toreturn.join(' ');
			}else{ // by days of month
				if( PIECES[2].contains('-') ){ // range of dates
					if( PIECES[3] != '*' ){
						toreturn.push( 'on ' + PIECES[3] + ' ' + PIECES[2].split('-')[0] + ' through ' + PIECES[3] + ' ' + PIECES[2].split('-')[1] );
					}else{
						toreturn.push( 'on ' + PIECES[2].split('-')[0] + ' through ' + PIECES[2].split('-')[1] + ' of any Month'  );
					}
				}else{
					toreturn.push( 'on ' + PIECES[3] + ' ' + PIECES[2].split('-')[0] );
				}
				return toreturn.join(' ');
			}
		}
	},

	parseCLIResponse : function (op){ // op is CLI command output via http 
		op = op.replace(/Response: Follows/, "");
		op = op.replace(/Privilege: Command/, "");
		op = op.replace(/--END COMMAND--/, "");
		return op;
	},

	parseContextLine: {
		read: function(q){ // ASTGUI.parseContextLine.read();
			// expects q as 'blah=foo' and returns ['blah','foo']
			var v = q.indexOf("=");
			if( v == -1){ return []; }
			return  [q.substring(0,v), q.substr(v+1)];
		},

		getExten: function(q){ // ASTGUI.parseContextLine.getExten();
			// use this when you want to get the pattern from a calling rule
			// expects q as 'exten=_X.,1,foo' or '_X.,1,foo'
			//	and returns _X.
			if( !q || !q.contains(',') ) { return ''; }
			if( q.match('exten=') ){
				return q.split('exten=')[1].split(',')[0];
			}else{
				return q.split(',')[0];
			}
		},

		getPriority: function(q){ // ASTGUI.parseContextLine.getPriority();
			// expects  q  as 'exten=s,2,foo' OR 's,2,foo'   and   returns 2
			if( q.match('exten=') ){
				return q.split('exten=')[1].split(',')[1].trim();
			}else{
				return q.split(',')[1].trim();
			}
		},

		getAppWithArgs: function(q){ // ASTGUI.parseContextLine.getAppWithArgs();
			// expects  q  as 'exten=s,2,foo(ssssssss,ssdsd,assd)' OR 's,2,foo(ssssssss,ssdsd,assd)' OR even 'foo(ssssssss,ssdsd,assd)'
			//	and   returns 'foo(ssssssss,ssdsd,assd)' ;  app with arguments(if any)

			if( !q.contains('(') ){ // if q == something like 's,n,Hangup' return 'Hangup'
				var l = q.lastIndexOf(',');
				return q.substring(l+1);
			}else{
				var tmp = q.beforeChar('(') ;
				if( !tmp.contains(',') ){
					return q;
				}else{
					var l = tmp.lastIndexOf(',');
					return q.substring(l+1);
				}
			}
			ASTGUI.ErrorLog( "ASTGUI.parseContextLine.getAppWithArgs() could not parse \"" + q + "\" " );
			return '';
		},

		getApp: function(q){ // ASTGUI.parseContextLine.getApp();
			// expects  q  as 'exten=s,2,foo(ssssssss,ssdsd,assd)' OR 's,2,foo(ssssssss,ssdsd,assd)'   
			//	and   returns 'foo' ;// appname -- without arguments
			var y = ASTGUI.parseContextLine.getAppWithArgs(q);
			return ( y.contains('(') ) ? y.split('(')[0].trim() : y.trim() ;
		},

		getArgs: function(q){ // ASTGUI.parseContextLine.getArgs();
			// expects  q  as 'exten=s,2,foo(ssssssss,ssdsd,assd)' OR 's,2,foo(ssssssss,ssdsd,assd)' OR 's,2,foo(ssssssss|ssdsd|assd)'
			// OR 's,1,Answer' OR 's,n,Hangup'
			// and   returns [ssssssss,ssdsd,assd] or [] // arguments as an array 

			q = q.trim();
			if ( !q.endsWith(')') || !q.contains('(') ){
				ASTGUI.ErrorLog( "ASTGUI.parseContextLine.getArgs() - No Argument found for \"" + q + "\" " );
				return [];
			}
			var y = ASTGUI.parseContextLine.getAppWithArgs(q);
			y = y.substr(0, (y.length-1));
			var x = y.afterChar('(');
			return this.getArgsArrayFromArgsString(x);
		},

		getArgsArrayFromArgsString: function(x){ // expects x as 'context,exten,pri' or 'context|exten|pri'
			if(x.contains('|') ){
				return x.split('|');
			}
			if(x.contains(',') ){
				return x.split(',');
			}
			return [x] ;
		},

		getArgsArrayFrom_AppWithArgs_String: function(x){ // expects x as 'goto(context,exten,pri)' or 'goto(context|exten|pri)'
			// usage : ASTGUI.parseContextLine.getArgsArrayFrom_AppWithArgs_String(x)
			if( !x.contains('(') ) {
				return this.getArgsArrayFromArgsString(y);
			}
			var y = x.substr(0, (x.length-1));
			    y = y.afterChar('(');
			return this.getArgsArrayFromArgsString(y);
		},

		toKnownContext: function(args){  // usage ASTGUI.parseContextLine.toKnownContext(y)
			// converts args to a readable format - ex: default|6000|1 to 'user 6000'
			if(typeof args == 'string'){
				args = this.getArgsArrayFromArgsString(args);
			}
			if( args[0] == 'default' ){
				var u = args[1] ;
				if( u == 'o'){
					return 'Goto Operator';
				}
				if( parent.sessionData.pbxinfo.users.hasOwnProperty(u) ){
					return 'Goto User ' + u ;
				}
			};
			if( args[0] == ASTGUI.contexts.QUEUES ){
				return 'Goto Queue ' + args[1] ;
			};
			if( args[0] == ASTGUI.contexts.CONFERENCES ){
				return 'Goto Conference ' + args[1] ;
			};
			if( args[0].contains(ASTGUI.contexts.RingGroupPrefix) ) {
				if( parent.sessionData.pbxinfo['ringgroups'].hasOwnProperty(args[0]) ){
					var rgname = parent.sessionData.pbxinfo['ringgroups'][args[0]].NAME ;
				}else{
					var rgname = ' ' + args[0] +  ' <font color=red><B>?</B></font>' ;
				}
				return 'Goto RingGroup ' + rgname ;
			};
			if( args[0].contains(ASTGUI.contexts.TimeBasedRulePrefix) ){
				var tbr_label = parent.sessionData.pbxinfo.timebasedRules[args[0]].label || args[0] ;
				return 'Goto TimeBased Rule -- ' + tbr_label  ;
			};
			if( args[0].contains(ASTGUI.contexts.VoiceMenuPrefix) ){
				var vm_name = parent.sessionData.pbxinfo.voicemenus[args[0]].comment || args[0] ;
				return 'Goto VoiceMenu -- ' + vm_name ;
			};
			if( args[0] == ASTGUI.contexts.VoiceMailGroups ){
				var t = parent.sessionData.pbxinfo.vmgroups;
				return 'Goto VoiceMail Group -- ' + (( t[args[1]] && t[args[1]]['label']) || args[1] ) ;
			}
			return 'Goto ' + args.join() ;
		},

		showAs : function(q){ // ASTGUI.parseContextLine.showAs(line)
			// expects q as 'extension,priority,Goto(context|extension|1)' or 'Goto(context|extension|1)' or 'Goto(context,extension,1)'
			// or 'extensions,priority,Hangup'
			// returns - "User extension" or 'VoiceMenu extension' or 'Hangup' or 'Busy' or some string - depends on q.
			// use this when you want to represent the action to the user

			var app = ASTGUI.parseContextLine.getApp(q) ;
			var args = ASTGUI.parseContextLine.getArgs(q) ;
			var q_LC = q.toLowerCase();
			var all_LC = app.toLowerCase() ;

			if( all_LC == "macro" ){
				if( args[0] && args[0].contains('trunkdial-failover') && args[1] ){
					var tmp_trunkDetails = ASTGUI.parseContextLine.parseTrunkDialArgument(args[1]);
					var tmp_trunkString = (tmp_trunkDetails.name) ? ' using trunk ' + tmp_trunkDetails.name : ' via ' + tmp_trunkDetails.channel ;
					return 'Dial ' + tmp_trunkDetails.prepend + tmp_trunkString ;
				}
				return 'Run Macro ' + (args[0] || '???');
			}

			if( all_LC == "answer" ){
				return 'Answer the call'
			}

			if( all_LC == "authenticate" ){
				return 'Authenticate for password ' + ( args[0] || ' ??? ' );
			}

			if( all_LC == "disa" ){
				return 'DISA ' + ( args[0] && ' using password ' + args[0] ) + ( args[1] && ' against context ' + args[1] ) ;
			}

			if( all_LC == "background" ){
				return 'Play ' + (args[0] || '???') + ' & Listen for KeyPress events' ;
			}

			if( all_LC == "playback" ){
				return 'Play ' + (args[0] || '???') + ' & Donot Listen for KeyPress events' ;
			}

			if( all_LC == "waitexten" ){
				return "Wait '"+ args[0] + "' sec for the user to enter an extension";
			}

			if( all_LC == "wait" ){
				return "Pause dialplan execution for '"+ args[0] + "' seconds";
			}

			if( all_LC == "hangup" ){
				return "Hangup call";
			}

			if( all_LC == "echo" ){
				return "do the ECHO test";
			}

			if( all_LC == "busy" ){
				return (args[0]) ? "Play BusyTone for '" + args[0] + "' seconds and Hangup" : 'Play Busy Tone indefinetely' ;
			}

			if( all_LC == "congestion" ){
				return (args[0]) ? "indicate Congestion for '" + args[0] + "' seconds and Hangup" : 'indicate congestion indefinetely' ;
			}

			if( all_LC == "directory" ){
				return 'Directory for ' + ( (args[0] && 'context ' +  args[0] ) || '???');
			}

			if( all_LC == "voicemailmain" ){
				return 'Check VoiceMail';
			}

			if( all_LC == "voicemail" ){
				return 'leave Voicemail for user ' + (args[0] || '???');
			}

			if( all_LC == "setmusiconhold" ){
				return "Set Music-On-Hold class '" + (args[0] || 'default') + "'" ;
			}

			if( all_LC == "meetme" ){
				return 'Goto Conference room ' + (args[0] || '???');
			}


			if( all_LC == "dial" ){
				return 'Dial ' + ( args[0] || '???' );
			}

			if( all_LC == "set" && args[0] && args[0].contains('timeout(digit)') ){
				return "Digit Timeout to " + args[0].afterStr('TIMEOUT(digit)=') + " seconds" ; //  exten => s,n,Set(TIMEOUT(digit)=5);
			}

			if( all_LC == "set" && args[0] && ( args[0].toLowerCase().contains('language()=') || args[0].toLowerCase().contains('channel(language)=') )  ){
				return "Set Language to " + args[0].afterStr(')=').trim() ; //
			}

			if( all_LC == "set" && args[0] && args[0].contains('timeout(response)') ){
				return "Response Timeout to " + args[0].afterStr('TIMEOUT(response)=') + " seconds" ; //  exten => s,n,Set(TIMEOUT(response)=10);
			}

			if( all_LC == "goto" ){
				return this.toKnownContext(args);
			}

			return q;
		},

		parseTrunkDialArgument: function(y){ // usage ASTGUI.parseContextLine.parseTrunkDialArgument(y)
			// expects y as  '${trunk_1}/XXX${EXTEN:X}' OR SIP/user/XXX${EXTEN:X}
			var WhatToDial = '';
			y = y.trim();
			if( y.beginsWith('${') && y.afterChar('}').beginsWith('/') ) {
				var trunkname = y.betweenXY('{' , '}');
				var channel = '' // TODO - lookup in globals context on extensions.conf
				WhatToDial = y.afterChar('}').substr(1);
			} else {
				var u = y.split('/');
				if( u.length > 2 && !y.beginsWith('${') ){ // y is in 'SIP/user/PREFIX_1${EXTEN:1}'
					var trunkname = null ;
					var channel = u[0] + '/' + u[1] ;
					u.splice(0,2);
					WhatToDial = u.join('/'); // take the part after second '/'
				}
			}
			// we expect WhatToDial to be in '1${EXTEN:1}' or in '${EXTEN}' or in '${EXTEN:1}' or in '9${EXTEN}' format or a plain extensin string
			if( WhatToDial.contains('${') ){
				if(!WhatToDial.contains('${EXTEN')){ // if WhatToDial is in some other format that the gui does not understand
					// TODO : replace the above if condition with a regular expression to check for the acceptable formats
					// TODO : THROW ERROR
					return null;
				}
				var prepend = WhatToDial.beforeChar('$') ;
				var extenString = WhatToDial.betweenXY('{','}') ;
				var stripXdigitsfromfront = ( extenString.contains(':') ) ? extenString.afterChar(':') || '0' : '0' ;
			} else { // WhatToDial is a plain extension string such as '911' or 'pari'
				var prepend = WhatToDial ;
				var stripXdigitsfromfront = 'ALL' ;
			}
			return { name : trunkname, channel : channel, prepend : prepend, stripx : stripXdigitsfromfront };
		},

		obCallingRule: function(str){ // usage ASTGUI.parseContextLine.obCallingRule(str)
			/* expects str as 
				//    'exten = _91256XXXXXXX,1,Macro( trunkdial-failover-0.3, ${trunk_1}/${EXTEN:2}, ${trunk_2}/${EXTEN:2},trunk_1,trunk_2 )'
				// OR
				//  exten = 1900!,1,Hangup ; BLOCK 1900 calls
				and returns
					{ 
						actualString : 'exten = _91256XXXXXXX,1,Macro( trunkdial-failover-0.3, ${trunk_1}/${EXTEN:2}, ${trunk_2}/${EXTEN:2},trunk_1,trunk_2 )'
						pattern : '_91256XXXXXXX',
						macroname : trunkdial-failover-0.3,
		
						firstTrunk : 'trunk_1' ,
						firstPrepend : '' , // prependtext for trunk1
						stripdigits_firstTrunk : 2,
		
						secondTrunk : 'trunk_2',
						secondPrepend : '' , // prependtext for trunk2
						stripdigits_secondTrunk : 2
					}
			*/

			var cr = { };
			cr.actualString = str ;
			cr.pattern = ASTGUI.parseContextLine.getExten(str);
			if( str.contains('Macro(') && str.contains('trunkdial') ){ // if is some version of trunk dial marco
				var macroargs = ASTGUI.parseContextLine.getArgs(str);
				cr.macroname = macroargs[0] ;
				var t1 = ASTGUI.parseContextLine.parseTrunkDialArgument( macroargs[1] ) ;
					cr.firstTrunk = t1.name ;
					cr.firstPrepend = t1.prepend ;
					cr.stripdigits_firstTrunk = t1.stripx ;
		
				if( macroargs.length <= 2  || ( macroargs.length > 2 && macroargs[2].trim() == '') ){ // if a failback trunk is not defined
					cr.secondTrunk = '' ;
					cr.secondPrepend = '' ;
					cr.stripdigits_secondTrunk = '' ;
				}else{
					var t2 = ASTGUI.parseContextLine.parseTrunkDialArgument( macroargs[2] ) ;
					cr.secondTrunk = t2.name ;
					cr.secondPrepend = t2.prepend ;
					cr.stripdigits_secondTrunk = t2.stripx ;
				}
			}else{
				cr.destination = ASTGUI.parseContextLine.getAppWithArgs( str ) ;
			}
			return cr;
		}
	},

	profiling : {
		start: function(){
			if(!top.sessionData.DEBUG_MODE ){ return true; }
			var now = new Date();
			top.sessionData.DEBUG_PROFILER_BEGIN = now.getTime() ;
		},

		snapShot: function(a){
			if(!top.sessionData.DEBUG_MODE ){ return true; }
			if ( !a || (typeof a != 'string') ){ a = ''; }
			var now = new Date();
			var diff = now.getTime() - top.sessionData.DEBUG_PROFILER_BEGIN ;
			ASTGUI.debugLog( '<B> Profiler Time : '+ diff +' ms</B> ' + a , '#990033');
			top.sessionData.DEBUG_PROFILER_BEGIN = now.getTime() ;
		}
	},

	resetTheseFields : function( flds ){ // ASTGUI.resetTheseFields(arr) , flds = [ el1, el2 , el_3 ] ; - sets each element to blank value
		if(!ASTGUI.isArray(flds)){ return; }
		var reset_el = function(el){
			var tmp_dfalt = $(el).attr('dfalt');
			switch(el.type){
				case 'text':
					el.value = '';
					if( tmp_dfalt )
						el.value = tmp_dfalt;
					break ;
				case 'checkbox':
					el.checked = false;
					if( tmp_dfalt)
						ASTGUI.domActions.checkIf_isAstTrue( el , tmp_dfalt);
					break ;
				case 'radio':
					el.checked = false;
					break ;
				case 'select-one':
					el.selectedIndex = -1;
					if(tmp_dfalt) ASTGUI.selectbox.selectOption(el, tmp_dfalt);
					break ;
				case 'textarea':
					el.value = '';
					if( tmp_dfalt )
						el.value = tmp_dfalt;
					break ;
				default : break ;
			}
		};
		var el;
		for (var i=0; i < flds.length ; i++ ) {
			el = flds[i] ;
			if ( typeof el == 'string'){ el = _$(el) ; }
			el.disabled = false;
			reset_el( el );
		}
	},

	selectbox: {
		selectDestinationOption: function(el, dest){ // ASTGUI.selectbox.selectDestinationOption(el,dest)
			// selects a given destination 'dest' in select box el
			// dest could be 'context|extention|priority' or 'context,etension,priority' or 'goto(context,etension,priority)' or 's,n,goto(context,etension,priority)'
			//console.log('We are looking for "' + dest + ' " in the selectbox');
			var args = [];
			if ( typeof el == 'string'){ el = _$(el) ; }
			el.selectedIndex = -1;
			if(!dest){return;}

			if(dest.contains('(')){
				var tmp = dest.beforeChar('(');
				if( tmp.contains(',') ){
					args = ASTGUI.parseContextLine.getArgs(dest);
				}else{
					args = ASTGUI.parseContextLine.getArgsArrayFrom_AppWithArgs_String(dest);
				}
			}else{
				if(dest.contains(',') || dest.contains('|') ){
					args = ASTGUI.parseContextLine.getArgsArrayFromArgsString(dest);
				}else{
					args = [dest];
				}
			}

			var args_v = args.join('|') ;
			var args_c = args.join(',') ;
			var dest_args_v = 'Goto('+ args.join('|') + ')';
			var dest_args_c = 'Goto('+ args.join(',') + ')' ;

			for( var i=0; i< el.options.length ; i++ ){
				//console.log(' **** ');
				//console.log(' OPTION vale is *' + el.options[i].value + '*');
				//console.log(' dest_args_c is *' + dest_args_c+ '*');
				//console.log(' dest_args_v is *' + dest_args_v+ '*');
				//console.log(' args_v is *' + args_v+ '*');
				//console.log(' args_c is *' + args_c+ '*');
				if( (el.options[i].value == dest_args_v) || (el.options[i].value == dest_args_c) || (el.options[i].value == args_v) || (el.options[i].value == args_c )){
					// the select box option vale could be 'goto(context,exten,priority)' or 'Hangup' or just 'context,exten,priority'
					el.selectedIndex = i;
					return;
				}
			}
		},

		populateArray: function(el, arr){ // arr = [{optionText:'TEXT', optionValue:'VALUE'}, {..}] // ASTGUI.selectbox.populateArray(el,arr);
			if ( typeof el == 'string'){ el = _$(el) ; }
			ASTGUI.selectbox.clear(el);
			try{
				for(var f=0, arr_l = arr.length ; f < arr_l ; f++){
					if ( typeof arr[f] == 'string' || !arr[f].optionText ){
						ASTGUI.selectbox.append( el, arr[f], arr[f] );
					}else{
						ASTGUI.selectbox.append( el, arr[f].optionText, arr[f].optionValue );
					}
				}
			}catch(err){}
		},

		readAllValues: function(el){
			if ( typeof el == 'string'){ el = _$(el) ; }
			var y = [] ;
			for (var x=0; x < el.options.length; x++) {
				if(el.options[x].value.trim()){
					y.push(el.options[x].value) ;
				}
			}
			return y;
		},

		populateOptions: function( el, n){
			if ( typeof el == 'string'){ el = _$(el) ; }
			n = Number(n);
			ASTGUI.selectbox.clear(el);
			var m = ASTGUI.selectbox.append;
			for ( var i=1 ; i <= n ; i++) { m(el, i, i); }
		},

		insert_before: function(el,txt, val, i){ // ASTGUI.selectbox.insert_before(el,txt, val, i);
			if ( typeof el == 'string'){ el = _$(el) ; }
			if($.browser.msie){
				el.add(new Option (txt,val), i );
			}else{
				el.add(new Option (txt,val), el.options[i] );
			}
		},

		insertOption_before: function(el,opt, i){
			if ( typeof el == 'string'){ el = _$(el) ; }
			if($.browser.msie){
				el.add(opt, i );
			}else{
				el.add(opt, el.options[i] );
			} 
		},

		append: function(el,txt, val){ // ASTGUI.selectbox.append(el,txt,val);
			if ( typeof el == 'string'){ el = _$(el) ; }
			el.options[el.options.length] = new Option (txt,val);
		},

		append_option: function(el,opt){
			if ( typeof el == 'string'){ el = _$(el) ; }
			if($.browser.msie){
				el.add(opt);
			}else{
				el.add(opt,null);
			}
		},

		remove_i: function(el, i){
			if ( typeof el == 'string'){ el = _$(el) ; }
			el.options[i] = null;
		},
	
		clear: function(el){
			if ( typeof el == 'string'){ el = _$(el) ; }
			el.options.length = 0;
		},

		selectOption: function(el, opt){ // ASTGUI.selectbox.selectOption(el,opt)
			if ( typeof el == 'string'){ el = _$(el) ; }
			el.selectedIndex = -1;
			for (var x=0; x < el.options.length; x++) {
				if (el.options[x].value == opt){
					el.selectedIndex = x;
				}
			}
		},

		selectOption_Add : function(el, opt){ // adds opt as new options if it is not already found 
			if ( typeof el == 'string'){ el = _$(el) ; }
			el.selectedIndex = -1;
			for (var x=0; x < el.options.length; x++) {
				if (el.options[x].value == opt){
					el.selectedIndex = x;
				} 
			}
			if(el.selectedIndex == -1){
				ASTGUI.selectbox.append(el, opt, opt);
				ASTGUI.selectbox.selectOption(el, opt);
			}
		}
	}, // { selectbox }

	selectRange_populate : function(g , els){
		/* 	TODO
			The 'selectRange_populate function' is right now a bit heavy, ugly and relies extensively on closures.
			this function should in future be replaced with a prototype based object
		*/
		if(typeof g == 'string'){ g = _$(g); }
		g.startRange = '';
		g.stopRange = '';
		var range_documentCatch = function(){
			try{
				var children = g.childNodes;
				for (var i = 0; i < children.length; i++) {
					var tmp = children[i] ;
					ASTGUI.events.remove( tmp , 'mousemove' , update_range ) ;
				};
			}catch(err){
			
			}finally{
				ASTGUI.events.remove( document , 'mouseup' , range_documentCatch ) ;
			}
		};
		var range_start = function(event){
			g.startRange = g.stopRange = this.innerHTML;
			//console.log( 'Range is : ' + g.startRange + ' to ' + g.stopRange );
			if($.browser.msie){
				event.returnValue = false;
			} else{
				event.preventDefault();
			}
	
			var children = g.childNodes ;
			for (var i = 0; i < children.length; i++) {
				var tmp = children[i] ;
				ASTGUI.events.add( tmp , 'mousemove' , update_range ) ;
				//$(tmp).css({backgroundColor : '#FFFFFF' });
				tmp.className = 'selectRange_notselected';
			};
			ASTGUI.events.add( document , 'mouseup' , range_documentCatch ) ;
			//$(this).css({backgroundColor :'#EFEFEF' });
			$(this).addClass('selectRange_selected');
		};
		var update_range = function(event){
			if($.browser.msie){
				event.returnValue = false;
			} else{
				event.preventDefault();
			}
			try{
				g.stopRange = this.innerHTML;
			}catch(err){
				var p = ASTGUI.events.getTarget(event) ;
				g.stopRange = p.innerHTML;
			}
			//console.log( 'Range is : ' + g.startRange + ' to ' + g.stopRange );
			var x = els.indexOf(g.startRange) ;
			var y = els.indexOf(g.stopRange) ; 
			var start_index = Math.min(x,y);
			var stop_index = Math.max(x,y);
	
			var children = g.childNodes;
			for (var i = 0; i < children.length; i++) {
				var tmp = children[i] ;
				var tmp_html = tmp.innerHTML;
				var tmp_index = els.indexOf(tmp_html) ;
				tmp.className = ( tmp_index <= stop_index && tmp_index >= start_index ) ? 'selectRange_selected' : 'selectRange_notselected' ;
				//$(tmp).css({backgroundColor : ( tmp_index <= stop_index && tmp_index >= start_index ) ? '#EFEFEF' : '#FFFFFF' });
			};
		};
		var range_stop = function(){
			//console.log( 'Range is : ' + g.startRange + ' to ' + g.stopRange );
			var x = els.indexOf(g.startRange) ;
			var y = els.indexOf(g.stopRange) ; 
			var start_index = Math.min(x,y);
			var stop_index = Math.max(x,y);
			g.startRange = els[start_index];
			g.stopRange = els[stop_index];
	
			var children = g.childNodes;
			for (var i = 0; i < children.length; i++) {
				var tmp = children[i] ;
				var tmp_html = tmp.innerHTML;
				var tmp_index = els.indexOf(tmp_html) ;
				ASTGUI.events.remove( tmp , 'mousemove' , update_range ) ;
				//$(tmp).css({backgroundColor : ( tmp_index <= stop_index && tmp_index >= start_index ) ? '#EFEFEF' : '#FFFFFF' });
				tmp.className = ( tmp_index <= stop_index && tmp_index >= start_index ) ? 'selectRange_selected' : 'selectRange_notselected' ;
			};
			ASTGUI.events.remove( document , 'mouseup' , range_documentCatch ) ;
		};
	
		els.each(function(elm){
			var tmp = document.createElement('SPAN'); 
			tmp.innerHTML = elm ;
			tmp.className = 'selectRange_notselected';
			$(tmp).mousedown( range_start );
			$(tmp).mouseup( range_stop );
			g.appendChild( tmp );
		});
	
		$(g).css({cursor:'pointer'});

		g.reset_range = function(){
			g.startRange = g.stopRange = '';
			var children = g.childNodes;
			for ( var i = 0; i < children.length; i++ ) { children[i].className = 'selectRange_notselected' ; }
		};

		g.set_range = function(a,b){
			var x = els.indexOf(a) ;
			var y = els.indexOf(b) ; 
			g.startRange = Math.min(x,y) ;
			g.stopRange = Math.max(x,y);
			var children = g.childNodes;
			for ( var i = 0; i < children.length; i++ ) {
				var tmp = children[i] ;
				var tmp_html = tmp.innerHTML;
				var tmp_index = els.indexOf(tmp_html) ;
				children[i].className = ( tmp_index <= g.stopRange && tmp_index >= g.startRange ) ? 'selectRange_selected' : 'selectRange_notselected' ;
			}
		};
	}, // End of selectRange_populate

	showbg: function(t){ // show/hide a transparent bg layer - ASTGUI.showbg(true);
		try{
		if(t){
			if( !document.getElementById('bg_transparent') ){ 
				var d = document.createElement( 'DIV' ) ;
				d.setAttribute('id','bg_transparent');
				document.body.appendChild(d) ;
			}else{
				var d = document.getElementById('bg_transparent') ;
				d.style.display = '';
			}
			return;
		}
		if( document.getElementById('bg_transparent') ){ 
			var d = document.getElementById('bg_transparent') ;
			d.style.display = 'none';
		}
		}catch(err){}
	},

	showToolTips : function(){
		if(window.jQuery && $.tooltip){
			$('img.tooltipinfo').tooltip({delay:0.5,showURL:false,fixPNG:true,showBody:" - ",extraClass:"pretty fancy",top:-35,left:10});
		}
	},

	sortContextByExten: function(cxt , getAll){ // ASTGUI.sortContextByExten( cxt , boolean); 
		// if boolean set to false or null or undefined --> consider only 's' & interger extensions
		// if boolean set to true --> get every pattern

		/* goal is to sort a context array as sorted by asterisk dialplan (almost)
			Ex: ['exten=s,2,App2','exten=s,1,App1','exten=1,1,App', 'exten=s,n,AppN'] 
				will be converted to 

			{
				s:['s,1,App1','s,2,App2','s,3,AppN'], //each extension will be sorted
				1:['1,1,App']
			}
			This function is help ful when you try to represent a set of context lines in order in the GUI Ex: in VoiceMenus
			WARNING: ******* this function attempts to convert 'n' priority to a number ****
		*/

		var TO_RETURN = {}, EXTENSIONS = {};
		cxt.each( function(line , cxt_index) {
			if( !line.beginsWith('exten=') ) return;
			var exten = ASTGUI.parseContextLine.getExten(line);
			if( !getAll && isNaN(exten) && exten !='s' ) return; // we only handle numbers and 's' at this time
			if( ! EXTENSIONS.hasOwnProperty(exten) ){
				EXTENSIONS[exten] = [] ;
			}
			EXTENSIONS[exten].push(line) ;
		} );
		
		// sorting to make sure we return in the right order
		for( var THIS_EXTEN in EXTENSIONS ){ if(EXTENSIONS.hasOwnProperty(THIS_EXTEN) ){
			TO_RETURN[THIS_EXTEN] = [];
			var TMP_CONTEXT = EXTENSIONS[THIS_EXTEN];
			TMP_CONTEXT.each( function(line, line_index){
				var priority = ASTGUI.parseContextLine.getPriority(line);
				if( priority == 'n' ){
					var new_Priority = Number(ASTGUI.parseContextLine.getPriority(TMP_CONTEXT[line_index-1])) + 1 ;
					if( TO_RETURN[THIS_EXTEN].indexOfLike( THIS_EXTEN + ','+ new_Priority + ',' ) == -1 ){
						var new_line = THIS_EXTEN + ',' + new_Priority + ',' + ASTGUI.parseContextLine.getAppWithArgs(line);
						TO_RETURN[THIS_EXTEN].push(new_line);
					}
					return;
				}else{
					priority = Number( priority ) ;
					for(var g=0; g < TO_RETURN[THIS_EXTEN].length ; g++ ){
						var tmp_priority = Number( ASTGUI.parseContextLine.getPriority( TO_RETURN[THIS_EXTEN][g] ) );
						if( priority < tmp_priority ){
							TO_RETURN[THIS_EXTEN].splice(g,0, line.afterChar('=') );
							return;
						}
					}
					TO_RETURN[THIS_EXTEN].push( line.afterChar('=') );
				}
				return true ;
			});
		}}
		return TO_RETURN;
	},

	startDrag : function(event, movethis ){
		if(!movethis){
			var et = ASTGUI.events.getTarget(event) ;
			while( et.nodeName.toUpperCase() != 'DIV' ){
				et = et.parentNode ;
			}
			var mt = et;
		}else{
			var mt = _$(movethis);
		}
		var MTSW = mt.style.width || $(mt).width();
		var MTSH = mt.style.height  || $(mt).height();
		var mt_pos = ASTGUI.domActions.findPos(mt);
		var tmp_div = document.createElement('DIV'); 
		tmp_div.style.position = 'absolute';
		tmp_div.style.left = mt_pos.cleft ;
		tmp_div.style.top = mt_pos.ctop ;
		tmp_div.style.width = MTSW ;
		tmp_div.style.height = MTSH ;
		$(tmp_div).css({ borderWidth:'2px', borderStyle:'dashed', borderColor:'red', zIndex: 10000 });
		document.body.appendChild(tmp_div);

		var timer;
		var dragdelay = (jQuery.browser.msie) ? 70 : 40;
		var initialcursorX, initialcursorY, initialwindowleft, initialwindowtop, maxleft, maxtop ;
		var stopDrag = function(){
			mt.style.left = tmp_div.style.left ;
			mt.style.top = tmp_div.style.top ;
			ASTGUI.events.remove( document , "mousemove" , movewindow ) ;
			ASTGUI.events.remove( document , "mouseup" , stopDrag ) ;
			clearInterval(timer);
			mt.style.MozOpacity = mt.style.opacity = 1.0;
			tmp_div.parentNode.removeChild(tmp_div);
		};

		mt.style.MozOpacity = mt.style.opacity = 0.85; // ondrag Opacity
		var movewindow = function(event){
			var x,y;
			if(typeof window.scrollX != "undefined"){
				x = event.clientX + window.scrollX;
				y = event.clientY + window.scrollY;
			}else{
				x =  window.event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
				y = window.event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
			}
			var tmp_top = initialwindowtop  + y - initialcursorY ; 
			var tmp_left = initialwindowleft + x - initialcursorX;
			if( tmp_left > 0 && tmp_left < maxleft ){ tmp_div.style.left = tmp_left; }
			if( tmp_top > 0 && tmp_top < maxtop ){ tmp_div.style.top  = tmp_top; }
			ASTGUI.events.remove( document , "mousemove" , movewindow ) ;
		};
	
		if(typeof window.scrollX != "undefined"){
			initialcursorX = event.clientX + window.scrollX;
			initialcursorY = event.clientY + window.scrollY;
		}else{
			initialcursorX =  window.event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
			initialcursorY = window.event.clientY + document.documentElement.scrollTop + document.body.scrollTop;
		}
	
		initialwindowleft = mt_pos.cleft;
		initialwindowtop = mt_pos.ctop;
	
		if(typeof window.innerWidth != "undefined"){
			maxleft = window.innerWidth - parseInt( MTSW , 10) ;
			maxtop = window.innerHeight - parseInt( MTSH , 10) ;
		}else{
			maxleft = document.body.offsetWidth - parseInt(MTSW, 10) ;
			maxtop = document.body.offsetWidth- parseInt(MTSH, 10) ;
		}

		timer = setInterval( function(){ ASTGUI.events.add( document , "mousemove" , movewindow ) } , dragdelay ) ;
		ASTGUI.events.add( document , "mouseup" , stopDrag ) ;
		if(event.preventDefault){
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
	},

	systemCmd: function(cmd, callbackfunction){ // ASTGUI.systemCmd(cmd, cbf);
		ASTGUI.debugLog("Executing System Command : '" + cmd + "'" , 'system');
		var delay_cb = function(){
			if( parent.sessionData.PLATFORM.isAA50 ){
				setTimeout( callbackfunction , 500 );
			}else{
				callbackfunction();
			}
		};
		makeRequest({
			     action : 'originate' ,
			    channel : 'Local/executecommand@' + ASTGUI.contexts.guitools ,
			   Variable : 'command=' + cmd ,
			application : 'noop' ,
			    timeout : '60000' ,
			   callback : delay_cb
		});
	},

	systemCmdWithOutput: function( cmd , cb ) {
		// usage :: ASTGUI.systemCmdWithOutput( 'uptime' , callback(output){ /* do something with output */ } );
		// Use this function when you want to execute a specific system command and read the output
		// output will be sent as a argument to the callback function
		var fcmd = cmd + ' > ' + this.paths['guiInstall'] + ( this.paths['output_SysInfo'].afterChar('/') || this.paths['output_SysInfo'] ) ;
		var after = function(){
			parent.document.getElementById('ajaxstatus').style.display = 'none';
			var op = ASTGUI.loadHTML( ASTGUI.paths.output_SysInfo ) ;
			cb( op ) ;
		};
		var delay_cb = function(){ setTimeout(after,500); };
		if( parent.sessionData.PLATFORM.isAA50 ){
			parent.document.getElementById('ajaxstatus').style.display = '';
			this.systemCmd( fcmd , delay_cb );
		}else{
			this.systemCmd( fcmd , after );
		}
	},

	tabbedOptions: function(el, arr){
		// usage ASTGUI.tabbedOptions ( _$('el') , [{url:'#', desc:'Option1', selected:true}, {url:'x.html', desc:'Option2'}]);
		if ( typeof el == 'string'){ el = _$(el) ; }
		var k = document.createElement('TABLE');
		var nr = k.insertRow(-1);
		var jq_K = $(k);
		jq_K.attr('align','center');
		jq_K.attr('cellpadding','0');
		jq_K.attr('cellspacing','0');
		jq_K.css( {margin:'10px', padding:'10px'});

		arr.each(function(item){
			var nc = nr.insertCell( nr.cells.length );
			if(item.click_function){
				var ih = '<a href=# class=tab onclick="">' + item.desc +'</a>';
				var ih = document.createElement('A');
				ih.href= '#';
				ih.className ='tab';
				ih.innerHTML = '<nobr>' + item.desc + '</nobr>';
				$(ih).click(function(){
					this.blur();
					$(el).find('A').removeClass('tabselected').addClass('tab');
					this.className = 'tabselected';
					item.click_function();
				});
				nc.appendChild(ih);
			}else{
				var ih = (item.selected && item.selected == true )  ? '<nobr><a href=# class=tabselected>' + item.desc +'</a></nobr>' : '<nobr><a href="' + item.url + '" class=tab>' + item.desc +'</a></nobr>';
				nc.innerHTML = ih;
			}
			nc.align = 'center';
			nc.valign = 'bottom';
			$(nc).css( {borderBottom:'4px solid #000000'});
		});
		
		el.appendChild(k);
	},

	toLocalTime: function (k){ // Converts the UTC time read on the appliance to the browsers local time
		// expects k as 'Fri Dec  8 23:59:59 UTC 2008'
		try{
			var tmp = k.split(" ");
			if(tmp[2] == ""){ tmp.splice(2,1) ; }
			// tmp[0] = 'Fri' , tmp[1] ='Dec', tmp[2] = '8', tmp[3] = '23:59:59', tmp[4]= 'always assume UTC', tmp[5] = '2008'
			var temp = tmp[3].split(':'); // hours =  parseInt(temp[0]), minutes = parseFloat(temp[1]);
			// convert these values to local time
			var months_strings = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug","sep","oct","nov","dec"];
			var day_strings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
			var month_no = months_strings.indexOf(tmp[1].toLowerCase());
	
			var utc_date = new Date();
			utc_date.setUTCFullYear ( tmp[5] , month_no , tmp[2] );
			utc_date.setUTCHours ( parseInt(temp[0]), parseInt(temp[1]) );
		
			var lt_hours = utc_date.getHours(); // 0 to 23
			var lt_minutes = utc_date.getMinutes(); // 0 to 59
			var lt_month = months_strings[utc_date.getMonth()]; // 0 to 11
			var lt_dom = utc_date.getDate(); // 1 to 31
			var lt_year = utc_date.getFullYear() ; // 2007
			var lt_day = day_strings[utc_date.getDay()] ; // 0 to 6
		
			return lt_day + " " + lt_month + " " + lt_dom + ", " + lt_hours + ":" + lt_minutes + " " + lt_year;
		}catch(err){
			return '';
		}
	},

	updateaValue: function(e){
		// ASTGUI.updateaValue(  {file:'users.conf', context :'6000', variable :'hassip', value :'yes'}   )
		var u = new listOfSynActions(e.file) ;
		u.new_action('update', e.context, e.variable , e.value );
		var g = u.callActions();
		return (g.contains('Response: Success')) ? true : false ;
	},

	updateFieldToValue : function( el, val ){ // updates a field el, to value 'val' - el could be a text box, select-option, or a checkbox
		// ASTGUI.updateFieldToValue(el,val)
		if ( typeof el == 'string'){ el = _$(el) ; }
		var tmp_dfalt = $(el).attr('dfalt');

		switch(el.type){
			// TODO come up with a way to handle radio buttons
			case 'text':
				el.value = val ;
				if( tmp_dfalt && !val ) el.value = tmp_dfalt;
				break ;
			case 'textarea':
				el.value = val ;
				if( tmp_dfalt && !val ) el.value = tmp_dfalt;
				break ;
			case 'checkbox':
				ASTGUI.domActions.checkIf_isAstTrue( el , val);
				if( tmp_dfalt && ( typeof val == 'undefined' || val == '' ) ){
					ASTGUI.domActions.checkIf_isAstTrue( el , tmp_dfalt);
				}
				break;
			case 'radio':
				ASTGUI.ErrorLog('You are on your own with Radio Buttons');
				break ;
			case 'select-one':
				ASTGUI.selectbox.selectOption(el, val);
				if( tmp_dfalt && !val ) ASTGUI.selectbox.selectOption(el, tmp_dfalt);
				break;
			default:
				break;
		}
		return;
	},

	highlightField: function( field , msg ){ // ASTGUI.highlightField( field, msg );
		if(typeof field =='string'){ field = _$(field); }
		var pcn = field.className || '' ;
		if(msg){
			 ASTGUI.feedback({ msg: msg, showfor: 3 });
		}
		field.className = 'inputValidationFailed';
		setTimeout( function(){ field.className = pcn; } , 3000 );
		try{ field.focus(); }catch(e){ }
	},

	validateFields : function( fields ){ // ASTGUI.validateFields ( [ 'field_x' , el_x ] );
		for(var g=0; g < fields.length ; g++ ){
			var field = fields[g];
			if(typeof field =='string'){ field = _$(field); }
			var validation = $(field).attr('validation') ;
			if(!validation){ continue; }
			var this_field_name = $(field).attr('field_name') ;
			var x = field.value ;
			var pcn = ( field.className ) ? field.className : '' ;

			switch(validation){
				case 'numeric':
					// check if field's value is numeric - otherwise highlight field and return false
					var fb_msg = (this_field_name) ? this_field_name + ' is a numeric field.<BR> Letters and Punctuation are not allowed in this field.' : 'This is a numeric field.<BR> Letters and Punctuation are not allowed in this field.';
					if ( /[^0-9]/.test(x) ){
						ASTGUI.highlightField( field, fb_msg );
						return false;
					}
					break;
				case 'numeric_plus':
					// check if field's value is numeric - otherwise highlight field and return false
					var fb_msg = (this_field_name) ? this_field_name + ' is a numeric field.<BR> Letters and Punctuation are not allowed in this field.' : 'This is a numeric field.<BR> Letters and Punctuation are not allowed in this field.';
					if ( /[^0-9\+]/.test(x) ){
						ASTGUI.highlightField( field, fb_msg );
						return false;
					}
					break;
				case 'alphanumeric':
					if ( /[^a-zA-Z0-9]/.test(x) ){
						var fb_msg = (this_field_name) ? this_field_name + ' is a AlphaNumeric field.<BR> Punctuation and Special Characters are not allowed in this field.' : 'This is a AlphaNumeric field.<BR> Punctuation and Special Characters are not allowed in this field.';
						ASTGUI.highlightField( field, fb_msg );
						return false;
					}
					break;
				case 'alphanumericUnd':
					var fb_msg = (this_field_name) ? this_field_name + ' is a AlphaNumeric field.<BR> Punctuation and Special Characters are not allowed in this field.' : 'This is a AlphaNumeric field.<BR> Punctuation and Special Characters are not allowed in this field.';
					if ( /[^a-zA-Z_0-9]/.test(x) ){
						ASTGUI.highlightField( field, fb_msg );
						return false;
					}
					break;
				case 'alphanumericUndSpace':
					var fb_msg = (this_field_name) ? this_field_name + ' is a AlphaNumeric field.<BR> Punctuation and Special Characters are not allowed in this field.' : 'This is a AlphaNumeric field.<BR> Punctuation and Special Characters are not allowed in this field.';
					if ( /[^a-zA-Z_0-9 ]/.test(x) ){
						ASTGUI.highlightField( field, fb_msg );
						return false;
					}
					break;
				case 'dialpattern':
					var fb_msg = (this_field_name) ? 'Invalid Characters in ' + this_field_name  : 'Invalid character in a Dial Pattern field.';
					if ( /[^a-zA-Z_0-9\.!\[\]\-\+]/.test(x) ){
						ASTGUI.highlightField( field, fb_msg );
						return false;
					}
					break;
				case 'macaddress':
					var fb_msg = (this_field_name) ? this_field_name + ' is a MAC address field.<BR> Only HEX characters are allowed.' : 'This is a MAC address field.<BR> Only HEX characters are allowed.';
					if ( /[^a-fA-F0-9:\-]/.test(x) ){
						ASTGUI.highlightField( field, fb_msg );
						return false;
					}
					/*
					if ( x.trim() && x.length != 12 ){
						ASTGUI.highlightField( field, 'invalid MAC address !.<BR> MAC address should be 12 digits long.');
						return false;
					}
					*/
					break;
				case 'voipusername':
					var fb_msg = 'Punctuation and Special Characters are not allowed in this field.' ;
					if ( /[^a-zA-Z_0-9\.]/.test(x) ){
						ASTGUI.highlightField( field, fb_msg );
						return false;
					}
					break;
				default:
					break;
			}
		}
		return true;
	},

	yesOrNo : function(yn){
		// yn = { msg:'' , ifyes: function(){} , ifno: fn (optional), btnYes_text :'Yes' (optional), btnNo_text :'No'(optional) }
		// ASTGUI.yesOrNo ( {msg: 'dddddd', ifyes:function(){alert("Yes");} ,  ifno:function(){alert("No");} , hideNo: true, dialogWidth:490, dialogHeight:290 } );
		ASTGUI.showbg(true);
		var dv = document.createElement("DIV");
		dv.className = 'dialog' ;
		dv.style.width= yn.dialogWidth || 425;
		dv.style.height= yn.dialogHeight || 175;
		dv.style.left = 270;
		dv.style.top = 110;
		(function(){
			var tbl_h = document.createElement("TABLE");
				tbl_h.cellPadding = 0;
				tbl_h.cellSpacing = 0;
				tbl_h.style.width = '100%';
				var newRow = tbl_h.insertRow(-1);
					newRow.className = "dialog_title_tr";
				var newcell = newRow.insertCell( newRow.cells.length );
					ASTGUI.events.add( newRow , "mousedown" , ASTGUI.startDrag );
					newcell.innerHTML = yn.title || 'Are you sure ?' ;
					newcell.className = "dialog_title";
			dv.appendChild(tbl_h);
		})();
		(function(){
			var dv_q = document.createElement("TABLE");
			dv_q.style.width = '100%';

			var newRow = dv_q.insertRow(-1);
			ASTGUI.domActions.tr_addCell( newRow , { html: yn.msg, align: 'center', valign:'middle', height: '70' } );

			var newRow2 = dv_q.insertRow(-1);
			var newcell2 = newRow2.insertCell( newRow2.cells.length );
			newcell2.align = 'center';
			newcell2.valign = 'bottom';
			newcell2.height = '55';
			var btnYES = document.createElement("span");
			btnYES.innerHTML = (yn.btnYes_text)? yn.btnYes_text : 'Yes' ;
			btnYES.className = 'button_yn' ;
			ASTGUI.events.add( btnYES , 'click' , function() {
				dv.parentNode.removeChild(dv);
				ASTGUI.showbg(false);
				yn.ifyes();
			});
			var btnNo = document.createElement("span");
			btnNo.innerHTML = ( yn.btnNo_text ) ? yn.btnNo_text : 'No' ;
			btnNo.className = 'button_yn' ;
			ASTGUI.events.add( btnNo , 'click' , function() {
				dv.parentNode.removeChild(dv);
				ASTGUI.showbg(false);
				if( yn.ifno ){ yn.ifno(); }
			});
			newcell2.appendChild( btnYES );
			if( !yn.hideNo ){
				newcell2.appendChild( btnNo );
			}
			dv.appendChild(dv_q);
		})();
		document.body.appendChild(dv);
	}
}; // ( AstGUI )

ASTGUI.paths = {};

ASTGUI.paths['guiInstall'] = '/var/lib/asterisk/static-http/config/';
ASTGUI.paths['rawman'] = '../../rawman';
ASTGUI.paths['asteriskConfig'] = '/etc/asterisk/';
ASTGUI.paths['ConfigBkp'] = '/var/lib/asterisk/gui_backups/';
ASTGUI.paths['ConfigBkp_AA50'] = '/var/lib/asterisk/sounds/backups/'; // AA50 bkp path on C.F
ASTGUI.paths['ConfigBkp_dldPath'] = ASTGUI.paths['guiInstall'] + 'private/bkps/'; // path for keeping the bkp files for download

ASTGUI.paths['Sounds'] = '/var/lib/asterisk/sounds/';
ASTGUI.paths['MOH'] = '/var/lib/asterisk/moh/' ; // path for music on hold files
ASTGUI.paths['menusRecord'] = ASTGUI.paths['Sounds'] + 'record/' ;

ASTGUI.paths['scripts'] = '/var/lib/asterisk/scripts/';/* Directory for gui scripts (listfiles, for example) */	
ASTGUI.paths['output_SysInfo'] = './sysinfo_output.html' ;
ASTGUI.paths['voicemails_dir'] = '/var/spool/asterisk/voicemail/default/' ;

ASTGUI.scripts = {};

ASTGUI.scripts['takeBackup'] = 'sh ' + ASTGUI.paths['scripts'] + 'takebackup';
ASTGUI.scripts['restoreBackup'] = 'sh ' + ASTGUI.paths['scripts'] + 'restorebackup';
ASTGUI.scripts['SysInfo'] = 'sh ' + ASTGUI.paths['scripts'] + 'gui_sysinfo';
ASTGUI.scripts['ListFiles'] = 'sh ' + ASTGUI.paths['scripts'] + 'listfiles';
ASTGUI.scripts['NetworkSettings'] = 'sh ' + ASTGUI.paths['scripts'] + 'networking.sh';
ASTGUI.scripts['generateZaptel'] = 'sh ' + ASTGUI.paths['scripts'] + 'editzap.sh';
ASTGUI.scripts['generatemISDN_init'] = 'sh ' + ASTGUI.paths['scripts'] + 'editmisdn.sh';
ASTGUI.scripts['dldsoundpack'] = 'sh ' + ASTGUI.paths['scripts'] + 'dldsoundpack';

ASTGUI.apps = {};
ASTGUI.apps['Ztscan'] = 'ztscan > ' + ASTGUI.paths['asteriskConfig'] +'ztscan.conf' ;
ASTGUI.apps['mISDNscan'] = 'misdn-init scan' ;
ASTGUI.apps['flashupdate'] = 'flashupdate' ;

ASTGUI.includeContexts = [ 'default' , 'parkedcalls' , ASTGUI.contexts.CONFERENCES , ASTGUI.contexts.RingGroupExtensions , ASTGUI.contexts.VoiceMenuExtensions , ASTGUI.contexts.QUEUES , ASTGUI.contexts.VoiceMailGroups , ASTGUI.contexts.Directory ] ;

ASTGUI.customObject.prototype = {
	getProperty: function(p){
		return (this.hasOwnProperty(p))? this[p] : '' ;
	},
	updateProperties: function(prop){
		for( var g in prop ){
			if( prop.hasOwnProperty(g) ){
				this[g] = prop[g];
			}
		}
	},
	getOwnProperties: function(){
		var a = [] ;
		for( var i in this ) {
			if ( this.hasOwnProperty(i) ){
				a.push(i) ;
			}
		}
		return a ;
	}
};

var makeRequest = function( params){ // for making Asynchronus requests
	// usage ::  makeRequest ( { action :'getconfig', filename: 'something.conf', callback:callbackfunction() } )
	var cb = params.callback ; delete params.callback;
	if( params.action == "updateconfig" ){
		params.srcfilename = params.filename;
		params.dstfilename = params.filename;
		if(top.sessionData.DEBUG_MODE ){ASTGUI.debugLog("AJAX Request : '" + ASTGUI.getObjectPropertiesAsString(params) + "'" , 'update');}
		delete params.filename;
	}else{
		if(top.sessionData.DEBUG_MODE ){ASTGUI.debugLog("AJAX Request : '" + ASTGUI.getObjectPropertiesAsString(params) + "'" , 'get');}
	}

	$.get(ASTGUI.paths.rawman, params, cb);
}; // ( makeRequest )

var makeSyncRequest = function( params){ // for making synchronus requests
	// usage ::  makeSyncRequest ( { action :'getconfig', filename: 'something.conf' } ) // no need for call back function
	if(top.sessionData.DEBUG_MODE ){ASTGUI.debugLog("AJAX Request : '" + ASTGUI.getObjectPropertiesAsString(params) + "'" , 'update');}
	var s = $.ajax({ url: ASTGUI.paths.rawman, data: params , async: false });
	return s.responseText;
};


var context2json = function(params){ 
	// usage :: context2json({ filename:'something.conf' , context : 'context_1' , usf:0 })
	// get a specific context from a file
	// you can also use config2json - but if you want to save that 20ms wasted for 
	// parsing all those other contexts you are not inrested in, use this.
	// TODO use 'getconfig with a specific context' when running on supported asterisk versions
	var toJSO = function(z){
		var cat = (params.usf) ? new ASTGUI.customObject : [] ;
		var t = z.split("\n");
		var catno = -1 ;
		var l_catno , catname , tlc , subfield , v, subfield_a, subfield_b;
		var catfound = false;
		for(var r=0, tl =  t.length ; r < tl ; r++){
			tlc = t[r].toLowerCase();
			if( tlc.beginsWith("category-") ){
				catname = t[r].afterChar(':');
				catname = catname.trim() ;
				if( catname != params.context){ catno = -1; continue; }
				catno = Number( t[r].betweenXY('-', ':') );
				catfound = true;
			}
			if( catno == -1 ){ continue; }
			if( tlc.beginsWith("line-") ){
				var l_catno = Number( t[r].betweenXY('-','-') );
				if( l_catno != catno ){ continue; }

				subfield = t[r].afterChar(':'); // subfield
				subfield = subfield.trim();
				if(params.usf){
					v = subfield.indexOf('=');
					subfield_a = subfield.substring(0,v);//subfield variable
					subfield_b =  subfield.substr(v+1) ;//subfield variable value
					if( cat.hasOwnProperty(subfield_a) ){
						cat[subfield_a] += ',' + subfield_b ;
					}else{
						cat[subfield_a] = subfield_b;
					}
				}else{
					cat.push( subfield );
				}
			}
		}
		return (catfound)?cat : null ;
	};

	ASTGUI.debugLog("AJAX Request : reading '" +  params.filename + "'" , 'get');

	if( top.sessionData.FileCache.hasOwnProperty(params.filename) &&  top.sessionData.FileCache[params.filename].modified == false){ // if file is in cache and is not modified since
		var s = top.sessionData.FileCache[params.filename].content ;
	}else{
		if( parent.sessionData.PLATFORM.isAST_1_6 ){
			var s = $.ajax({ url: ASTGUI.paths.rawman+'?action=getconfig&filename='+params.filename+'&category='+params.context, async: false }).responseText;
		}else{
			var s = $.ajax({ url: ASTGUI.paths.rawman+'?action=getconfig&filename='+params.filename, async: false}).responseText;
		}

		top.sessionData.FileCache[params.filename] = {};
		top.sessionData.FileCache[params.filename].content = s;
		top.sessionData.FileCache[params.filename].modified = false;
	}

	if(s.contains('Response: Error') && ( s.contains('Message: Config file not found') || s.contains('Message: Permission denied') ) ){
		// return ASTGUI.globals.fnf; // return 'file not found'
		if(s.contains('Message: Config file not found'))
			ASTGUI.ErrorLog( ' config file(' + params.filename +') not found ' );	
		if(s.contains('Message: Permission denied'))
			ASTGUI.ErrorLog('permission denied for reading file ' + params.filename );

		return (params.usf) ? new ASTGUI.customObject : [] ;
	}
	if( s.contains('Response: Error') ){
		return (params.usf) ? new ASTGUI.customObject : [] ;
	}
	return toJSO(s);
};

var config2json = function( params ){
	// usage :: config2json({filename:'something.conf', usf:0 }) or config2json({filename:'users.conf', catlist:'yes'})
	//	config2json({ configFile_output: output_string , usf:0 }) // you can also pass the output of a config file
	var toCATLIST = function(z){
		var a = [ ], catname = '' ;
		var t = z.split("\n");
		for(var r=0, tl =  t.length ; r < tl ; r++){
			if( t[r].toLowerCase().beginsWith("category") ){
				catname = t[r].afterChar(':'); // category 
				a.push( catname.trim() );
			}
		}
		return a;
	};
	var toJSO = function(z){
		// This function converts z, the asterisk config file as read using 'action=getconfig' to a JavaScript Object 
		// where z is originalRequest.responseText of the getconfig on a asterisk format config file, 
		// and p is 0 or 1, 
		//	 0 for non unique subfields ( extensions.conf context where there are multiple subfields with same name - -  Ex: 'exten ='   )
		//	 1 for unique subfields ( config files where there are no two subfields of a context have same name )
		//  if not sure ,  use p = 0 
		var p = params.usf;
		var a = new ASTGUI.customObject ;
		var json_data = "";
		var t = z.split("\n");
		var catname, subfield, v, subfield_a , subfield_b; 
		for(var r=0, tl =  t.length ; r < tl ; r++){
			if( t[r].toLowerCase().beginsWith("category") ){
				catname = t[r].afterChar(':'); // category 
				catname = catname.trim() ;
				if(!a[catname]){ // contexts could be spread at different places in the config file
					if(!p){
						a[catname] = [];
					}else{
						a[catname] = new ASTGUI.customObject ;
					}
				}
			}else if ( t[r].toLowerCase().beginsWith("line") ){
				subfield = t[r].afterChar(':'); // subfield
				subfield = subfield.trim();
					if(!p){
					a[catname].push(subfield);
				}else{
					v = subfield.indexOf("=");
					subfield_a = subfield.substring(0,v);//subfield variable
					subfield_b =  subfield.substr(v+1) ;//subfield variable value
					if(a[catname].hasOwnProperty(subfield_a)){
						a[catname][subfield_a] += ',' + subfield_b;
					}else{
						a[catname][subfield_a] = subfield_b;
					}
				}
			}
		}
		return a ;
	};

	if( params.configFile_output ){
		return toJSO( params.configFile_output );
	};

	ASTGUI.debugLog("AJAX Request : reading '" +  params.filename + "'" , 'get');

	if( top.sessionData.FileCache.hasOwnProperty(params.filename) &&  top.sessionData.FileCache[params.filename].modified == false){ // if file is in cache and is not modified since
		var s = top.sessionData.FileCache[params.filename].content ;
	}else{
		var s = $.ajax({ url: ASTGUI.paths.rawman+'?action=getconfig&filename='+params.filename, async: false }).responseText;

		top.sessionData.FileCache[params.filename] = {};
		top.sessionData.FileCache[params.filename].content = s;
		top.sessionData.FileCache[params.filename].modified = false;
	}

	if( s.contains('Response: Error') && s.contains('Message: Config file not found') ){
		// return ASTGUI.globals.fnf; // return 'file not found'
		ASTGUI.ErrorLog( ' config file(' + params.filename +') not found ' );
		return new ASTGUI.customObject;
	}
	if( s.contains('Response: Error') && s.contains('Message: Permission denied') ){
		ASTGUI.ErrorLog('permission denied for reading file ' + params.filename );
		return new ASTGUI.customObject;
	}

	if( params.catlist == 'yes'){
		return toCATLIST(s);
	}
	return toJSO(s);
}; // ( config2json )


var listOfSynActions = function(file){
	// this object should be used if you have 1 to 4 update actions needed to be performed synchronusly.
	// if you have a long list of update actions - use Asynchronus variant of this function  (listOfActions)
	/*	:: Usage ::
		var u = new listOfSynActions('users.conf') ;
		u.new_action('newcat', '6002', '', ''); // create new context
		u.new_action('append', '6002', 'allow', 'all'); // append 'allow=all'
		u.new_action('update', '6002', 'disallow', 'none','all'); // update 'disallow=all' to 'disallow=none'
		u.callActions(); // this is Synchronus function - these actions will be called immediately and the result will be returned
	*/
	//
	this.FILE_CONTENT = null ;
	this.params = {} ;
	this.params.action = 'updateconfig';
	this.params.srcfilename = file;
	this.params.dstfilename = file;
	if( !parent.sessionData.PLATFORM.isAST_1_4 ){
		this.FILE_CONTENT = config2json({ filename: file , usf:0 }) ;
	}
	this.actionCount = 0;
};

listOfSynActions.prototype = {
	new_action: function(action, cat, name, value, match){
		var s="";
		if( !parent.sessionData.PLATFORM.isAST_1_4 && this.FILE_CONTENT != null ){
			// the update/delete/delcat commands fail in Asterisk 1.6.X/trunk if the corresponding category/variables are not found
			// In Asterisk 1.4 we do not have to do this check
			switch( action ){
				case 'update':
					if( !this.FILE_CONTENT.hasOwnProperty(cat) ) return s;
					if( this.FILE_CONTENT[cat].indexOfLike(name+'=') == -1 ){
						action = 'append';
					}
					break;
				case 'delete':
					if( !this.FILE_CONTENT.hasOwnProperty(cat) || this.FILE_CONTENT[cat].indexOfLike(name+'=') == -1 ){
						return s;
					}
					break;
				case 'delcat':
					if( !this.FILE_CONTENT.hasOwnProperty(cat) ){
						return s;
					}
					break;
				default: break;
			}
		}

		var cnt = "" + this.actionCount;
		if(this.actionCount > 5){
			ASTGUI.ErrorLog('AG150'); // alert to developer
		}
		while(cnt.length < 6){ cnt = "0" + cnt; }
		this.params['Action-' + cnt] = action; // jquery takes care of encodeURIComponent(action) 
		this.params['Cat-' + cnt] = cat;
		this.params['Var-' + cnt] = name ;
		this.params['Value-' + cnt] = value ;
		if (match){ this.params['Match-' + cnt] = match; }
		this.actionCount += 1 ;
	},
	clearActions: function(newfile){ // newfile is optional
		var fn = newfile || this.params.srcfilename;
		this.actionCount = 0 ;
		this.params = {} ;
		this.params.action = 'updateconfig';
		this.params.srcfilename = this.params.dstfilename = fn;
		if( !parent.sessionData.PLATFORM.isAST_1_4 ){
			this.FILE_CONTENT = config2json({ filename: fn , usf:0 }) ;
		}
	},
	callActions: function(){
		if(!this.actionCount){ return 'Response: Success'; }
		if(top.sessionData.DEBUG_MODE ){
			ASTGUI.debugLog("AJAX Request : '" + ASTGUI.getObjectPropertiesAsString(this.params) + "'" , 'update'); 
		}
		var s = $.ajax({ url: ASTGUI.paths.rawman, data: this.params , async: false });
		return s.responseText;
	}
};

var listOfActions = function(fn){
	/*
	usage: 	var x = new listOfActions('users.conf');
		x.new_action('delcat', '6001', '', ''); // delete context 6001
		x.new_action('renamecat', '6003', '', '6004'); // rename context 6003 to 6004

		x.new_action('newcat', '6002', '', ''); // create new context
		x.new_action('append', '6002', 'allow', 'all'); // append 'allow=all'
		x.new_action('update', '6002', 'disallow', 'none','all'); // update 'disallow=all' to 'disallow=none'
		x.new_action('delete', '6002', 'hasiax', '',''); // delete subfield 'hasiax' (whatever may be the value)
		x.new_action('delete', '6002', 'hassip', '','yes'); // delete subfield 'hassip=yes' 
		.....
		x.callActions(after); // where after is the callback function

	*/
	this.FILE_CONTENT = null ;
	this.current_batch = 1 ;
	this.current_batch_actionnumber = 0 ;
	this.actions = {};
	if(fn){ 
		this.filename = fn;
		if( !parent.sessionData.PLATFORM.isAST_1_4 ){
			this.FILE_CONTENT = config2json({ filename: fn , usf:0 }) ;
		}
	}
};

listOfActions.prototype = {
	filename: function(fn){
		this.filename = fn;
		if( !parent.sessionData.PLATFORM.isAST_1_4 ){
			this.FILE_CONTENT = config2json({ filename: fn , usf:0 }) ;
		}
	},
	getacn: function(nc){
		return this.current_batch_actionnumber;
	},
	build_action: function(action, count, cat, name, value, match){
		var s="";
		if( !parent.sessionData.PLATFORM.isAST_1_4 && this.FILE_CONTENT != null ){
			// the update/delete/delcat commands fail in Asterisk 1.6.X/trunk if the corresponding category/variables are not found
			// In Asterisk 1.4 we do not have to do this check
			switch( action ){
				case 'update':
					if( !this.FILE_CONTENT.hasOwnProperty(cat) ) return s;
					if( this.FILE_CONTENT[cat].indexOfLike(name+'=') == -1 ){
						action = 'append';
					}
					break;
				case 'delete':
					if( !this.FILE_CONTENT.hasOwnProperty(cat) || this.FILE_CONTENT[cat].indexOfLike(name+'=') == -1 ){
						return s;
					}
					break;
				case 'delcat':
					if( !this.FILE_CONTENT.hasOwnProperty(cat) ){
						return s;
					}
					break;
				default: break;
			}
			// TODO : handle the case where , a new category is added in 'batch 1' and is deleted in 'batch 2'
			//		the 'delcat' in 'batch 2' would fail cause the switch does not know that the file has been changed after 'batch 1',
			//		and even if we update the FILE_CONTENT after each start_sqreqs() it would still fail cause the batches are already generated by then
			//	we could possibly generate the batches during callActions() and read the file before generating each batch and move this switch inside the batch

			//	This should not be a problem for the time being, but I will fix this issue once i get everything else working with 'asterisk 1.4/1.6.0/trunk'
			//	Note: this is not an issue with listOfSynActions() as clearActions() will take care of updating the file changes
		}
		var cnt = "" + count;
		while(cnt.length < 6)
			cnt = "0" + cnt;
		s += "&Action-" + cnt + "=" + encodeURIComponent(action);
		s += "&Cat-" + cnt + "=" + encodeURIComponent(cat);
		s += "&Var-" + cnt + "=" + encodeURIComponent(name);
		s += "&Value-" + cnt + "=" + encodeURIComponent(value);
		if (match)
			s += "&Match-" + cnt + "=" + encodeURIComponent(match);
		return s;
	},
	addNewChange: function(nc){
		var t = 'act_' + this.current_batch;
		this.actions[t] = (this.current_batch_actionnumber)? this.actions[t] + nc: nc ;
		if( this.current_batch_actionnumber == 5 ){
			this.current_batch++;
			this.current_batch_actionnumber = 0;
		}else{
			this.current_batch_actionnumber++;
		}
	},
	new_action: function(a,b,c,d,e){
		var z = this.getacn();
		var nc = e?this.build_action(a, z, b, c, d, e) : this.build_action(a, z, b, c, d) ;
		if(nc)this.addNewChange(nc);
	},
	callActions: function(callback){
		var ajxs = parent.document.getElementById('ajaxstatus') ;
		ajxs.style.display = '';
		if( this.current_batch == 1 && this.current_batch_actionnumber == 0 ){ 
			setTimeout( function(){ ajxs.style.display = 'none'; callback(); }, 500 ) ;
			return;
		}
		var pre_uri = "action=updateconfig&srcfilename=" + encodeURIComponent(this.filename) + "&dstfilename=" + encodeURIComponent(this.filename);
		var treq = this.actions;
		var start_sqreqs = function(st){
			var f = treq[ 'act_' + st ];
			if(f){
				ASTGUI.debugLog("AJAX Request : '" + pre_uri + f + "'" , 'update');
				$.ajax({ type: "GET", url: ASTGUI.paths.rawman, data: pre_uri + f , success: function(msg){start_sqreqs(st+1);} });
			}else{
				setTimeout( function(){ ajxs.style.display = 'none'; callback(); }, 500 ) ;
			}
		};
		start_sqreqs(1);
	}
};


(function(){
	var onload_doThese = function(){
		window.onerror = function(err, url, errcode ){ // Log any errors on this page
			var msg = 'ErrorCode / LineNumber : ' + errcode  + '<BR> Error : ' + err + '<BR> Location: ' + url ;
			ASTGUI.ErrorLog(msg);
			ASTGUI.dialog.hide();
			if( parent.sessionData.DEBUG_MODE ){ // show alerts only in debug mode
				var alertmsg = 'ErrorCode / LineNumber : ' + errcode  + '\n Error : ' + err + '\n Location: ' + url ;
				alert(alertmsg);
			}else{
				if ( jQuery.browser.msie ){ // If critical error in IE , reload entire GUI
					top.window.reload();
				}
			}

			return true;
		};

		ASTGUI.showToolTips(); // Load any tooltips in this page
		if( window.jQuery ){
			$().ajaxStart( function(){ parent.document.getElementById('ajaxstatus').style.display = ''; });
			$().ajaxStop( function(){
				setTimeout( function(){parent.document.getElementById('ajaxstatus').style.display = 'none';}, 500 );
			});
		}
		if( window.localajaxinit && (typeof localajaxinit == 'function' ) ){
			window.localajaxinit();
		}
	};
	if( window.attachEvent ){
		window.attachEvent( 'onload' , onload_doThese );
	}else if( window.addEventListener ){
		window.addEventListener( 'load' , onload_doThese , false );
	}
})();

