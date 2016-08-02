

//alert = function() {};

Array.prototype.unique=function(a){
  return function(){return this.filter(a)}}(function(a,b,c){return c.indexOf(a,b+1)<0
});

String.prototype.mask = function(m) {
    var m, l = (m = m.split("")).length, s = this.split(""), j = 0, h = "";
    for(var i = -1; ++i < l;)
        if(m[i] != "#"){
            if(m[i] == "\\" && (h += m[++i])) continue;
            h += m[i];
            i + 1 == l && (s[j - 1] += h, h = "");
        }
        else{
            if(!s[j] && !(h = "")) break;
            (s[j] = h + s[j++]) && (h = "");
        }
    return s.join("") + h;
};

var config = {
	// db:window.openDatabase("deparche","1","deparche",200000),
	SERVICE:"http://deparchecom.esy.es/webservice/",
	HOST: "http://deparchecom.esy.es/",
	monthNames : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto' , 'Septiembre' , 'Octubre', 'Noviembre', 'Diciembre'],
	monthNamesShort:['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
	dayNamesShort:['Don', 'Lun', 'Mar', 'Mir', 'Jue', 'Vie', 'Sab'],
	dayNames:['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado'],
	currentView:[],
	lastHref:"#content_wall",
	getPersonId:function(key){
		var k = key;
		if( k == "" ||  k == undefined){
			k = app.constants.user_key;	
		}
		try{
		 	return this._get(k);
		}catch(err){
			console.log(JSON.stringify(err));
			return "";
		}
	},
	_set:function(key, value){
		sessionStorage.setItem(key, value)
	},
	_get:function(key){
		return window.sessionStorage.getItem(key)
	},
	parseFecha:function(fecha){
		var options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
		var a = new Date(fecha);
		return a.toLocaleDateString("es-ES", options);
	}
}



