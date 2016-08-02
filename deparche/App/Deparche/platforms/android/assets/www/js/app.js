document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    app.autologin();
}

var mySwiper, $$ = Dom7;

var myApp = new Framework7({
    fastClicks: true,
    material: true,
    uniqueHistory: false,
    allowDuplicateUrls: true,
    cache: true,
    pushState: true,
    pushStateOnLoad: false,
    materialRipple: false
});

var mainView = myApp.addView('.view-main', {
    domCache: true,
});


$(".panel-left a.item-link").on("click", function (event) {
    try {
        var href = this.href;
        if (href !== config.lastHref && config.lastHref !== "") {
            config.lastHref = href;
            var i = 0;
            var view = $(this).data("content");
            var currentView = view.split(",");

            while (config.currentView[i]) {
                $(config.currentView[i]).empty();
                i++;
            }
            config.currentView = currentView;
        } else {
            config.lastHref = href;
        }
        myApp.closeModal();
    } catch (e) {
        Raven.captureException(e)
    }
})

$("#exitApp").on("click", function (ev) {
    app.toServer("POST", { usuario: config.getPersonId() }, "CerrarSesion", function (data) {
        if (data) {
            var url = window.location.href;
            var baseUrl = url.split("#!/#");
            document.location.replace(baseUrl[0]);
        }else{
            app.alert("No se pudo cerra la sesion");
        }
    }, true);

})

$$("#btn_login").on('click', function () {
    app.login();
});

$$(document).on("pageReinit", function (e) {
    if (e.detail.page.name == "dash") {
        app.getDash();
    }
    if (e.detail.page.name == "parches") {
        app.getParches();
    }
    if (e.detail.page.name == "detalleAmigo") {
        app.detalleAmigo(e);
    }
    if (e.detail.page.name == "detalleParche") {
        app.parcheDetalle.init();
    }
    if (e.detail.page.name == "amigos") {
        app.cargarAmigos();
    }
    if (e.detail.page.name == "notificaciones") {
        app.notificaciones.obtener();
    }
    if (e.detail.page.name == "programate") {
        //app.programate.init();  //Se quito por razones de rendimiento
    }
    if (e.detail.page.name == "detalleEvento") {
        app.programate.detalle(e);
    }
    if (e.detail.page.name == "perfil") {
        app.perfil.init();
    }
});

$$(document).on('pageInit', function (e) {
    if (e.detail.page.name == "registro") {
        var $tittle = $("#tituloRegistro");
        $tittle.text("Condiciones y privacidad");
        mySwiper = myApp.swiper('.swiper-container', {
            pagination: '.swiper-pagination',
            simulateTouch: false,
            nested: true,
            onlyExternal: true
        });
        $("a.btnSlide").on("click", function () {
            var position = $(this).data("slide");
            switch (position) {
                case 0:
                    debugger;
                    mySwiper.slideNext();
                    $tittle.text("Información del registro");
                    break;
                case 1:
                    var regex = /[\w-\.]{2,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/,
                        email = $("#email").val().trim(),
                        pass = $("#password").val().trim(),
                        rePass = $("#re_password").val().trim();

                    if (email === "" || pass == "") {
                        app.alert("");
                    } else if (!regex.test(email)) {
                        app.alert("Correo electrónico no válido.");
                    } else if ($("#password").val().trim() == "") {
                        app.alert("Debe especificar una contraseña");
                    } else if (rePass != pass) {
                        app.alert("Las contraseñas no coinciden");
                    } else {
                        mySwiper.slideNext();
                    }
                    break;
                case 2:
                    if ($("#nombre").val().trim() === "" || $("#apellido").val().trim() === "") {
                        app.alert("");
                    } else {
                        mySwiper.slideNext();
                    }
                    break;
                case 3:
                    var f = $("#fechaNac").val().trim();
                    var edad = f != "" || f.split('-')[0] != "" ? parseInt(new Date().getFullYear()) - parseInt(f.split('-')[0]) : 0;
                    if (edad < 18) {
                        app.alert("Debes ser mayor de edad.");
                    } else if (f == "") {
                        app.alert("");
                    } else if ($("#genero2").val().trim() == "") {
                        app.alert("Debes seleccionar un genero");
                    } else {
                        var formData = myApp.formToJSON('form.swiper-container');
                        var obj = {
                            fbid: null,
                            fgid: null,
                            idSistema: 234516123,
                            nombre: formData.nombre,
                            apellido: formData.apellido,
                            email: formData.email,
                            password: formData.password,
                            fechaNac: formData.fechaNac,
                            genero: formData.genero2
                        }
                        app.registro(obj);
                    }
                    break;
            }
        })
    }
    if (e.detail.page.name == "dash") {
        var ptrContent = $$('.pull-to-refresh-content');
        myApp.initPullToRefresh(ptrContent)
        ptrContent.on('refresh', function (e) {
            console.log("Refrescando");
            myApp.pullToRefreshDone();
        })
        app.getDash();
        app.notificaciones.init();

        //Boton para ir a la pantalla de publicacion
        $$("#btn_publicacion").on("click", function () {
            mainView.router.loadPage({ pageName: 'publicacion' });
        });

        //Boton para tomar la foto y luego ir a la pantalla de publicacion
        $$("#btn_agregar_imagen_primero").on("click", function () {
            if (navigator.camera === undefined) {
                myApp.alert('EstÃ© dispositivo no es compatible con la funciÃ³n de cÃ¡mara', "Deparche");
                return;
            }
            navigator.camera.getPicture(onSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
        })
        function onSuccess(imageURI) {
            urlImage = imageURI;
            var image = document.getElementById('myPhotoImage');
            image.src = imageURI;
            $("#myPhotoImage").attr("style", "width:100%;")
            withImage = true;
            mainView.router.loadPage({ pageName: 'publicacion' });
        }
        function onFail(message) {
            myApp.alert('No podemos tomar la foto ahora D: - ' + message, "Deparche");
        }
    }
    if (e.detail.page.name == "publicacion") {

        function clear_publicacion() {
            $("#txt_publicacion_text").val("");
            $("#myPhotoImage").attr("src", "");
            $("#myPhotoImage").attr("style", "width:0;")
            $("#enlace_publicacion").html("");
            mainView.router.back();
        }

        //Boton para agregar una foto a la publicacion
        var withImage = false;
        var urlImage = "";
        $$("#btn_agregar_imagen_camera").on("click", function () {
            if (navigator.camera === undefined) {
                myApp.alert('EstÃ© dispositivo no es compatible con la funciÃ³n de cÃ¡mara', "Deparche");
                return;
            }
            navigator.camera.getPicture(onSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI, targetWidth: 700, targetHeight: 600 });
        })
        function onSuccess(imageURI) {
            urlImage = imageURI;
            var image = document.getElementById('myPhotoImage');
            image.src = imageURI;
            $("#myPhotoImage").attr("style", "width:100%;")
            withImage = true;
        }
        function onFail(message) {
            myApp.alert('No podemos tomar la foto ahora D: - ' + message, "Deparche");
        }

        //Boton para cancelar la publicacion
        $$("#btn_cancelar_publicacion").on("click", function () {
            clear_publicacion();
        });

        //Boton de publicar
        $$("#btn_publicar").on("click", function () {
            if ($("#txt_publicacion_text").val().trim() == "") {
                return;
            }
            var obj = {
                postPadre: null,
                grupo: null,
                comentarioCompartir: null,
                comentarioCompartirHtml: null,
                usuarioComenta: config.getPersonId(),
                usuarioMuro: config.getPersonId(),
                publicacion: $("#txt_publicacion_text").val(),
                publicacionHtml: $("#txt_publicacion_text").val(),
                publicacionFoto: (withImage ? 1 : 0),
                descripcion: null,
                video: null,
                image: (withImage ? urlImage.substr(urlImage.lastIndexOf('/') + 1) : null)
            };

            //Si se va a publicar con imagen
            if (withImage) {

                var win = function (r) {
                }

                var fail = function (error) {
                    myApp.alert('No podemos crear parches ahora D: ', "Deparche");
                }

                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = urlImage.substr(urlImage.lastIndexOf('/') + 1);
                options.mimeType = "image/jpeg";
                options.params = obj;
                var ft = new FileTransfer();
                ft.upload(urlImage, encodeURI(config.SERVICE + 'Publicar'), win, fail, options);

                myApp.addNotification({
                    message: 'PublicaciÃ³n aÃ±adida a tu muro',
                    button: {
                        text: 'Aceptar',
                        color: 'white'
                    }, hold: 3000
                });

                mainView.router.loadPage({ pageName: 'dash' });
                app.getDash();
                clear_publicacion();
                return;
            }

            app.toServer('POST', obj, 'Publicar', function (data) {
                //mainView.router.back();/// WTF ?
                myApp.addNotification({
                    message: 'PublicaciÃ³n aÃ±adida a tu muro',
                    button: {
                        text: 'Aceptar',
                        color: 'white'
                    }, hold: 3000
                });
                mainView.router.loadPage({ pageName: 'dash' });
                app.getDash();
                clear();
            }, true);
        });

        //Boton para cargar una imagen desde la galeria
        $$("#btn_agregar_imagen_album").on("click", function () {
            if (navigator.camera === undefined) {
                myApp.alert('EstÃ© dispositivo no es compatible con la funciÃ³n de cÃ¡mara', "Deparche");
                return;
            }
            navigator.camera.getPicture(onSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI, sourceType: Camera.PictureSourceType.PHOTOLIBRARY });
        });
    }
    if (e.detail.page.name == "gustos") {
        var ul = $$('form.form-gustos > ul'), item, id = config.getPersonId(app.constants.user_key);
        app.toServer('POST', { usuario: id }, "CargarGustos", function (data) {
            console.log(data);
            for (var i = 0; i < data.length; i++) {
                item = data[i];
                ul.append(
                    '<li><label class="label-checkbox item-content">' +
                    '<input type="checkbox" name="partystyles" value="' + item.idGusto + '">' +
                    '<div class="item-media"><i class="icon icon-form-checkbox"></i></div>' +
                    '<div class="item-inner"><div class="item-title">' + item.nombre + '</div></div>' +
                    '</label>' +
                    '</li>');
            }
            myApp.hidePreloader();
        }, true);

        $$("#gustos").on("click", function () {
            var formData = myApp.formToJSON('form.form-gustos');
            if (formData.partystyles.length <= 0) {
                app.alert(app.constants.anyOption);
            } else {
                var gustos = formData.partystyles.toString();
                var dt = {
                    gustos: "" + gustos + "",
                    usuario: config.getPersonId(app.constants.user_key)
                }
                console.log(dt);
                app.toServer('POST', dt, "AgregarGusto", function (data) {
                    if (data.estado) {
                        app.toServer('POST', { usuario: config.getPersonId() }, "DetalleUsuario", function (datos) {
                            debugger;
                            console.log(datos);
                            config._set(app.constants.user_key, datos.info.idUsuario)
                            config._set('ciudad', datos.info.idCiudad)
                            $$("#image_profile").attr("src", config.HOST + datos.info.urlImagen);
                            $$("#lbl_user_name").text(datos.info.nombre + " " + datos.info.apellido);
                            $$("#lbl_mensaje_personal").text(datos.info.mensajePersonal);
                            mainView.router.loadPage({ pageName: 'dash' });
                            myApp = new Framework7({
                                fastClicks: true,
                                material: true,
                                uniqueHistory: false,
                                allowDuplicateUrls: true,
                                cache: true,
                                pushState: true,
                                swipePanel: 'left',
                                materialRipple: false
                            });
                        }, true)
                    } else {
                        app.alert(data.mensaje.trim());
                    }
                }, true);
            }
            //mainView.router.loadPage({pageName:"dash"});
        })
    }
    if (e.detail.page.name == "programate") {
    }
    if (e.detail.page.name == "crearParche") {

        function clear_parche() {
            $("#txt_nombre_nuevo_parche").val("");
            $("#image_crear_parche").attr("src", "");
            $("#image_crear_parche").attr("style", "width:0;")
            mainView.router.back();
        }

        //app.debug("Por qui paso");
        /// Esto para tomar la foto
        urlImage = "";
        $$("#btn_foto_crear_parche").on("click", function () {
            if (navigator.camera === undefined) {
                myApp.alert('EstÃ© dispositivo no es compatible con la funciÃ³n de cÃ¡mara', "Deparche");
                return;
            }
            navigator.camera.getPicture(onSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI, targetWidth: 700, targetHeight: 600 });
        })
        function onSuccess(imageURI) {
            urlImage = imageURI;
            var image = document.getElementById('image_crear_parche');
            image.src = imageURI;
            $("#image_crear_parche").attr("style", "width:100%;")
        }
        function onFail(message) {
            myApp.alert('No podemos tomar la foto ahora :( - ' + message, "Deparche");
        }
        /// Fin foto


        $$("#btn_crear_parche").on("click", function () {

            var win = function (r) {
            }

            var fail = function (error) {
                myApp.alert('No podemos crear parches ahora D: ', "Deparche");
            }

            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = urlImage.substr(urlImage.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";
            options.params = { nombre: $$("#txt_nombre_nuevo_parche").val(), usuario: config._get(app.constants.user_key) };
            var ft = new FileTransfer();
            ft.upload(urlImage, encodeURI(config.SERVICE + 'AgregarParche'), win, fail, options);

            myApp.addNotification({
                message: 'Parche creado! invita a tus amigos',
                button: {
                    text: 'Aceptar',
                    color: 'white'
                }, hold: 3000
            });

            mainView.router.loadPage({ pageName: 'parches' });
            app.getDash();
        });
    }
    if (e.detail.page.name == "parches") {
        var mySearchbar = myApp.searchbar('.searchbar', {
            searchList: '.list-block-search',
            searchIn: '.item-title'
        });
        app.getParches();
    }
    if (e.detail.page.name == "amigos") {
        app.cargarAmigos();
        $("#listaamigos").on("click", "li > .item-media > img", function (ev) {
            var f = $(this).data("amigo");
            mainView.router.loadPage(
                {
                    pageName: 'detalleAmigo',
                    query: {
                        friend: f
                    }
                });
        })
    }
    if (e.detail.page.name == "detalleParche") {
        app.parcheDetalle.init();
    }
    if (e.detail.page.name == "detalleAmigo") {
        app.detalleAmigo(e);
    }
    if (e.detail.page.name == "eventos") {
        debugger;
        var calendarInline = myApp.calendar({
            container: '#calendar-inline-container',
            value: [new Date()],
            multiple: true,
            weekHeader: false,
            monthNamesShort: config.monthNamesShort,
            monthNames: config.monthNames,
            toolbarTemplate:
            '<div class="toolbar calendar-custom-toolbar">' +
            '<div class="toolbar-inner">' +
            '<div class="left">' +
            '<a href="#" class="link icon-only"><i class="icon icon-back"></i></a>' +
            '</div>' +
            '<div class="center"></div>' +
            '<div class="right">' +
            '<a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>' +
            '</div>' +
            '</div>' +
            '</div>',
            onOpen: function (p) {
                $$('.calendar-custom-toolbar .center').text(config.monthNames[p.currentMonth] + ', ' + p.currentYear);
                $$('.calendar-custom-toolbar .left .link').on('click', function () {
                    calendarInline.prevMonth();
                });
                $$('.calendar-custom-toolbar .right .link').on('click', function () {
                    calendarInline.nextMonth();
                });
            },
            onMonthYearChangeStart: function (p) {
                $$('.calendar-custom-toolbar .center').text(config.monthNames[p.currentMonth] + ', ' + p.currentYear);
            },
            onDayClick: function (p, dayContainer, year, month, day) {
                //Aqui para ir al dia_detalle
            }
        });
        //Agregar marca al calendario
        //calendarInline.addValue( intValue );

        //Convertir Date a Int
        //mydate.getTime();
        $(".picker-header").remove();
        $(".picker-footer").remove();
    }
    if (e.detail.page.name == "notificaciones") {
        app.notificaciones.obtener();
    }
    if (e.detail.page.name == "perfil") {
        app.perfil.init();
    }
    if (e.detail.page.name == "detalleEvento") {
        app.programate.detalle(e);
    }
    if (e.detail.page.name == "crearEvento") {
        debugger;
        $("#btn_agregar_parches_programate").on("click", function () {
            app.programate.cargarParches();
        });
        $("#btn_agregar_amigos_programate").on("click", function () {
            app.programate.cargarAmigos();
        });
    }
    if (e.detail.page.name == "programate") {
        app.programate.init();
    }
    if (e.detail.page.name == "buscarAmigos") {
        $("#searchFriends").on("keyup", function () {
            app.buscarAmigos.buscar(this.value);
        })
    }
});

var app = {
    login: function (user,pass) {
        var email = $("#txt_email").val().trim(), password = $("#txt_password").val().trim();
        if (email == "" || password == "") {
            app.alert();
            return false;
        }
        var data = {
            email: email,
            password: password,
            uuid:  typeof device === "undefined" ? "0" : device.uuid
        };
        app.toServer("POST", data, "Login", function (datos) {
            if (!datos.estado) {// Si el usuario no existe
                app.alert('Credenciales incorrectas, verifique e intente nuevamente.');
            } else {
                app.debug(datos.data.id);
                config._set(app.constants.user_key, datos.data.id)
                config._set('ciudad', datos.data[0].ciudadResidencia)
                mainView.router.loadPage({ pageName: 'dash' });
                $$("#image_profile").attr("src", config.HOST + datos.data.urlImagen);
                $$("#lbl_user_name").text(datos.data[0].nombre + " " + datos.data.apellido);
                $$("#lbl_mensaje_personal").text(datos.data.mensajePersonal);
                myApp = new Framework7({
                    fastClicks: true,
                    material: true,
                    uniqueHistory: false,
                    allowDuplicateUrls: true,
                    cache: true,
                    pushState: true,
                    swipePanel: 'left',
                    materialRipple: false
                });
            }
        }, true);
    },
    autologin: function () {
        app.toServer("POST", { uuid: device.uuid }, "ListarInfoUUID", function (datos) {
            if (datos.estado == true) {
                config._set(app.constants.user_key, datos.data.id)
                //alert(datos.data.id);
                config._set('ciudad', datos.data.ciudadResidencia)
                mainView.router.loadPage({ pageName: 'dash' });
                $$("#image_profile").attr("src", config.HOST + datos.data.urlImagen);
                $$("#lbl_user_name").text(datos.data.nombre + " " + datos.data.apellido);
                $$("#lbl_mensaje_personal").text(datos.data.mensajePersonal);
                myApp = new Framework7({
                    fastClicks: true,
                    material: true,
                    uniqueHistory: false,
                    allowDuplicateUrls: true,
                    cache: true,
                    pushState: true,
                    swipePanel: 'left',
                    materialRipple: false
                });
            }
        }, true)
    },
    registro: function (data) {
        debugger;
        app.toServer('POST', data, 'Registro', function (datos) {
            if (datos.estado) {
                debugger;
                app.alert("Tu registro ha sido satisfactorio.");
                config._set(app.constants.user_key, datos.idRegistro);
                mainView.router.loadPage({ pageName: "gustos" })
            } else {
                app.alert(datos.mensaje.trim());
            }
        }, true);
    },
    alert: function (msg) {
        debugger;
        if (msg === undefined) {
            myApp.alert(app.constants.emptyInput, 'DeParche');
        } else if (msg.trim() == "") {
            myApp.alert(app.constants.emptyInput, 'DeParche');
        } else {
            myApp.alert(msg, 'DeParche');
        }
    },
    constants: {
        emptyInput: 'Por favor complete los campos.',
        error: 'Ocurrio un error.',
        anyOption: 'Por favor seleccione al menos una opción.',
        test: 'Test alert',
        user_key: "uid",
    },
    toServer: function (method, data, url, fn, sl) {
        try {
            if (sl) {
                myApp.showPreloader('Cargando...');
            }
            $.ajax({
                url: config.SERVICE + url,
                type: method,
                dataType: 'json',
                data: data,
            }).done(function (datos) {
                fn(datos);
            }).fail(function (wx, data, ww) {
                myApp.hidePreloader();
                console.log(wx);
                app.alert(app.constants.error);
            })
        } catch (err) {
            myApp.hidePreloader();
            app.alert(app.constants.error);
            Raven.captureException(err)
        }
        myApp.hidePreloader();
    },
    getDash: function () {
        app.toServer('POST', { usuario: config._get(app.constants.user_key) }, 'CargarPublicaciones', function (data) {

            function isImage(img) {
                return img == null ? "" : img == "" ? "" : '<img src="' + config.HOST + data[i].publicacion.urlImage + '" width="100%">'
            }

            $("#content_wall").html("Cargando...");
            var template = "";
            lon = data.length;

            if (lon == 0) {

                $("#content_wall").html('<div class="card"><div class="card-content"><div class="card-content-inner">Comparte lo que estas haciendo con tus amigos, tambien puedes crear parches y eventos!</div></div>');
                return;
            }

            for (var i = 0; i < lon; i++) {
                template += '<div class="card facebook-card"><div class="card-header"><div class="facebook-avatar"><img class="image_profile_card" src="' + config.HOST + data[i].publicacion.urlImagenPublica + '" width="34" height="34"></div><div class="facebook-name">' + data[i].publicacion.nombrePublica + '</div><div class="facebook-date" style="font-size: 12px; font-style: italic;">' + data[i].publicacion.fechaRegistro + '</div></div><div class="card-content"><div class="card-content-inner"><p>' + data[i].publicacion.postPublicado + '</p>' +
                    (
                        data[i].publicacion.idPostPadre == 0 || data[i].publicacion.idPostPadre == null ?
                            "" :
                            '<div class="publicacion_compartida"><p>' + data[i].publicacion.comentarioCompartir + '</p></div>'
                    ) +
                    isImage(data[i].publicacion.urlImage)
                    + '<p class="color-gray">Brindaron: ' + data[i].publicacion.cantidadLikes + '    Comentarios: ' + data[i].comentarios.length + '</p></div></div><div class="card-footer"><div class="img-brindar"><img src="img/main_icon.png"><a href="#" class="link">Brindar</a></div><a href="#" class="link">Comentar</a></div></div> ';
            }
            $("#content_wall").css({ "background-color": "#D3D6DB !important" });
            $("#content_wall").html(template);
        }, false);
    },
    getParches: function () {
        var template = '';
        app.toServer('POST', { usuario: config._get(app.constants.user_key) }, 'CargarParchesUsuario', function (data) {
            var lon = data.length;
            if (lon == 0) {
                $$("#lista_parches").html('<div class="card" style="margin-top: 50px;"><div class="card-content"><div class="card-content-inner">Aún no estas en ningún parche, unete o crea uno!</div></div>');
                return;
            }
            app.parcheDetalle.data = data;
            for (var i = 0; i < lon; i++) {
                template += '<li><a href="#" class="item-link item-content" id="' + i + '" onclick="app.parcheDetalle.go(this)"><div class="item-media"><img src="' + (config.HOST + data[i].urlImage) + '" style="border-radius: 50%; height: 44px; width: 45px;"></div><div class="item-inner"><div class="item-title-row"><div class="item-title">' + data[i].nombre + '</div></div><div class="item-subtitle"><span style="font-style: italic; color: gray;">Invita a tus amigos!</span></div></div></a></li>';
            }
            $$("#lista_parches").html(template);
        }, true);
    },
    debug: function (output) {
        if (true) {
            console.log(output);
        }
    },
    parcheDetalle: {
        go: function (obj) {
            app.parcheDetalle.index = obj.id;
            mainView.router.loadPage({ pageName: 'detalleParche' });
        },
        data: null,
        index: 0,
        getDash: function (grupo) {
            app.toServer('POST', { grupo: grupo }, 'CargarPublicaciones', function (data) {

                function isImage(img) {
                    return img == null ? "" : img == "" ? "" : '<img src="' + config.HOST + data[i].publicacion.urlImage + '" width="100%">'
                }

                $("#publicaciones").html("Cargando...");
                var template = "";
                lon = data.length;

                if (lon == 0) {
                    $("#publicaciones").html('<div class="card"><div class="card-content"><div class="card-content-inner">Sin publicaciones... se el primero de tus amigos en compartir algo!</div></div>');
                    return;
                }

                for (var i = 0; i < lon; i++) {
                    template += '<div class="card facebook-card"><div class="card-header"><div class="facebook-avatar"><img class="image_profile_card" src="' + config.HOST + data[i].publicacion.urlImagenPublica + '" width="34" height="34"></div><div class="facebook-name">' + data[i].publicacion.nombrePublica + '</div><div class="facebook-date" style="font-size: 12px; font-style: italic;">' + data[i].publicacion.fechaRegistro + '</div></div><div class="card-content"><div class="card-content-inner"><p>' + data[i].publicacion.postPublicado + '</p>' +
                        (
                            data[i].publicacion.idPostPadre == 0 || data[i].publicacion.idPostPadre == null ?
                                "" :
                                '<div class="publicacion_compartida"><p>' + data[i].publicacion.comentarioCompartir + '</p></div>'
                        ) +
                        isImage(data[i].publicacion.urlImage)
                        + '<p class="color-gray">Likes: ' + data[i].publicacion.cantidadLikes + '    Comments: ' + data[i].comentarios.length + '</p></div></div><div class="card-footer"><a href="#" class="link">Brindar</a><a href="#" class="link">Comentar</a></div></div> ';
                }
                $("#publicaciones").html(template);
            }, true);
        },
        getMembers: function (grupo) {
            app.toServer('POST', { grupo: grupo }, 'ListarMiembrosParche', function (data) {

                //app.debug(data);

                $("#miembros_parche").html("Cargando...");
                var template = "";
                lon = data.length;;

                if (lon == 0) {
                    $("#miembros_parche").html('<div style="margin-top: 40px;" class="card"><div class="card-content"><div class="card-content-inner">Sin miembros... no dudes en invitar tus amigos a tu parches!</div></div>');
                    return;
                }

                for (var i = 0; i < lon; i++) {
                    template += '<li class="item-content"><div class="item-media"><img src="' + (config.HOST + data[i].urlImagen) + '" class="img-amigo"></img></div><div class="item-inner"><div class="item-title">' + data[i].nombre + ' ' + data[i].apellido + '</div><div class="item-after"></div></div></li>';
                }

                $("#miembros_parche").html(template);

            }, false);
        },
        init: function () {
            localdata = app.parcheDetalle.data[app.parcheDetalle.index];
            if (localdata.creador != config.getPersonId()) {
                $$("#btn_borrar_parche").hide();
            } else {
                $$("#btn_borrar_parche").show();
            }
            $$("#invitarAmigoAlParche").on("click", function (event) {
                app.toServer("POST", { usuario: config.getPersonId() }, "ListarAmigos", function (data) {
                    lon = data.length;
                    template = "";
                    for (var i = 0; i < lon; i++) {
                        template += '<li class="item-content"><div class="item-media"><img src="' + config.HOST + data[i].urlImagen + '" class="img-amigo"></div><div class="item-inner"><div class="item-title">' + data[i].nombreCompleto + '</div><div class="item-after"><label class="label-checkbox"><input type="checkbox" name="my-checkbox" value="' + data[i].idUsuario + '"><div class="item-media"><i class="icon icon-form-checkbox"></i></div></label></div></div></li>';
                    }
                    var popupHTML = '<div class="popup">' +
                        '<div class="navbar">' +
                        '<div class="navbar-inner">' +
                        '<div class="left"><a href="#" class="link icon-only close-popup" data-panel="left"><img src="img/icons/back.svg"></a></div>' +
                        '<div class="center">Invitar amigos al parche</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="content-block">' +
                        '<div class="list-block">' +
                        '<ul style="margin-top: -33px;" id="lista_invitar_parche">' + template + '</ul>' +
                        '</div>' +
                        '</div>' +
                        '<div class="toolbar toolbar-bottom fixed-popup-toolbar">' +
                        '<div class="toolbar-inner">' +
                        '<a href="#" class="link close-popup">Cancelar</a>' +
                        '<a href="#" class="link" onclick="app.parcheDetalle.agregar()">Agregar</a>' +
                        '</div>' +
                        '</div>' +
                        '</div>';

                    myApp.popup(popupHTML);
                }, true);
            })
            $$("#parche_titulo").html(localdata.nombre);
            document.getElementById("img_parche_detalle").style.backgroundImage = "url(" + config.HOST + localdata.urlImage + ")";
            app.parcheDetalle.getDash(localdata.idParche);
            app.parcheDetalle.getMembers(localdata.idParche);
            $$("#btn_abandonar_parche").attr("onclick", "app.parcheDetalle.abandonar('" + localdata.idParche + "')")
        },
        abandonar: function (id) {
            myApp.confirm('Â¿Quieres abandonar este parche?', 'DeParche', function () {
                app.toServer("POST", { grupo: id, usuario: config.getPersonId() }, "SalirParche", function (data) {
                    app.debug({ grupo: id, usuario: config.getPersonId() });
                    myApp.alert('Abandonaste un parche', 'DeParche', function () {
                        mainView.router.back();
                    });
                }, true);
            });
        },
        agregar: function () {
            var cont = 0;
            var obj = $("#lista_invitar_parche")[0].childNodes;
            var lon = obj.length;
            for (var i = 0; i < lon; i++) {
                var temp = obj[i].childNodes[1].childNodes[1].childNodes[0].childNodes[0];
                if (temp.checked) {
                    app.toServer("POST", { usuarioInvita: config.getPersonId(), usuarioRecibe: temp.value, grupo: app.parcheDetalle.data[app.parcheDetalle.index].idParche }, "InvitarAmigoParche", function (data) {
                        //app.debug(data);
                    }, false);
                    cont++;
                }
            }
            myApp.closeModal();
            myApp.addNotification({
                message: 'Se invito a ' + cont + ' amigos',
                button: {
                    text: 'Aceptar',
                    color: 'white'
                }, hold: 3000
            });
        }
    },
    detalleAmigo: function (e) {
        var page = e.detail.page;
        var id = page.query.friend;
        app.toServer("POST", { usuario: id }, "DetalleUsuario", function (data) {
            //app.debug(data);
            $$("#lbl_nombre_amigo").html(data.info.nombre + " " + data.info.apellido);
            $$('#img_amigo_detalle')[0].style.backgroundImage = "url(" + config.HOST + data.info.urlImagen + ")";
            var _nombre_ = data.info.nombre;
            exec_dash = function () {
                app.toServer('POST', { usuario: id }, 'CargarPublicaciones', function (data) {

                    function isImage(img) {
                        return img == null ? "" : img == "" ? "" : '<img src="' + config.HOST + data[i].publicacion.urlImage + '" width="100%">'
                    }

                    $("#muroAmigo").html("Cargando...");
                    var template = "";
                    lon = data.length;

                    if (lon == 0) {
                        $("#muroAmigo").html('<div class="card"><div class="card-content"><div class="card-content-inner">' + _nombre_ + ' aun no comparte nada.</div></div>');
                        return;
                    }

                    for (var i = 0; i < lon; i++) {
                        template += '<div class="card facebook-card"><div class="card-header"><div class="facebook-avatar"><img class="image_profile_card" src="' + config.HOST + data[i].publicacion.urlImagenPublica + '" width="34" height="34"></div><div class="facebook-name">' + data[i].publicacion.nombrePublica + '</div><div class="facebook-date" style="font-size: 12px; font-style: italic;">' + data[i].publicacion.fechaRegistro + '</div></div><div class="card-content"><div class="card-content-inner"><p>' + data[i].publicacion.postPublicado + '</p>' +
                            (
                                data[i].publicacion.idPostPadre == 0 || data[i].publicacion.idPostPadre == null ?
                                    "" :
                                    '<div class="publicacion_compartida"><p>' + data[i].publicacion.comentarioCompartir + '</p></div>'
                            ) +
                            isImage(data[i].publicacion.urlImage)
                            + '<p class="color-gray">Likes: ' + data[i].publicacion.cantidadLikes + '    Comments: ' + data[i].comentarios.length + '</p></div></div><div class="card-footer"><a href="#" class="link">Brindar</a><a href="#" class="link">Comentar</a></div></div> ';
                    }
                    $("#muroAmigo").html(template);
                }, false);
            }
            exec_dash();
            app.toServer("POST", { usuario: id }, "ListarAmigos", function (data) {
                //app.debug(data);
                lon = data.length;
                if (lon == 0) {
                    $("#lista_amigos_amigo").html('<div class="card"><div class="card-content"><div class="card-content-inner" style="margin-top: -23px;">' + _nombre_ + ' aun no tiene amigos D:</div></div>');
                    return;
                }
                template = "";
                for (var i = 0; i < lon; i++) {
                    template += '<li class="item-content"><div class="item-media"><img src="' + config.HOST + data[i].urlImagen + '" class="img-amigo"></img></div><div class="item-inner"><div class="item-title">' + data[i].nombreCompleto + '</div><div class="item-after"><img src="img/icons/more.svg" class="create-links" data-friend="' + data[i].idUsuario + '"></img></div></div></li>';
                }
                $$("#lista_amigos_amigo").html("<ul>" + template + "</ul>");
            }, false);
        }, true);
    },
    cargarAmigos: function () {
        app.toServer("POST", { usuario: config.getPersonId() }, "ListarAmigos", function (data) {
            //app.debug(data);
            $$("#listaamigos").html("");
            if (data === null) { return; }
            lon = data.length;
            template = "";
            for (var i = 0; i < lon; i++) {
                template += '<li class="item-content"><div class="item-media"><img src="' + config.HOST + data[i].urlImagen + '" class="img-amigo" data-amigo="' + data[i].idUsuario + '"></img></div><div class="item-inner"><div class="item-title">' + data[i].nombreCompleto + '</div><div class="item-after"><img src="img/icons/more.svg" class="create-links" data-friend="' + data[i].idUsuario + '"></img></div></div></li>';
            }
            $$("#listaamigos").html(template);
            $$('.create-links').on('click', function () {
                var clickedLink = this;
                var friend = $(this).data("friend");
                var popoverHTML = '<div class="popover">' +
                    '<div class="popover-inner">' +
                    '<div class="list-block">' +
                    '<ul>' +
                    '<li><a href="#detalleAmigo?friend=' + friend + '" class="item-link list-button" onclick="myApp.closeModal()">Ver perfil</li>' +
                    '<li><a href="#" class="item-link list-button" onclick="app.agregarAmigo.cargarParches(' + friend + ')">Invitar a un parche</li>' +
                    '<li><a href="#" class="item-link list-button" onclick="app.eliminarAmigo(' + friend + ')">Eliminar</li>' +
                    '</ul>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                myApp.popover(popoverHTML, clickedLink);
            });
        }, true);
    },
    agregarAmigo: {
        agregar: function (id) {
            var cont = 0;
            var obj = $("#lista_invitar_amigo")[0].childNodes;
            var lon = obj.length;
            for (var i = 1; i < lon; i++) {
                var temp = obj[i].childNodes[1].childNodes[1].childNodes[0].childNodes[0];
                if (temp.checked) {
                    app.toServer("POST", { usuarioInvita: config.getPersonId(), usuarioRecibe: id, grupo: temp.value }, "InvitarAmigoParche", function () {
                        //app.debug(temp.checked);
                    }, false);
                    cont++;
                }
            }
            myApp.closeModal();
            myApp.addNotification({
                message: 'Se invito a ' + cont + ' parche',
                button: {
                    text: 'Aceptar',
                    color: 'white'
                }, hold: 3000
            });
        },
        cargarParches: function (id) {
            var template = '';
            app.toServer('POST', { usuario: config._get(app.constants.user_key) }, 'CargarParchesUsuario', function (data) {
                app.debug(data);
                var lon = data.length;
                for (var i = 0; i < lon; i++) {
                    template += '<li class="item-content">' +
                        '<div class="item-media"><img src="' + (config.HOST + data[i].urlImage) + '" class="img-amigo"></div>' +
                        '<div class="item-inner">' +
                        '<div class="item-title">' + data[i].nombre + '</div>' +
                        '<div class="item-after">' +
                        '<label class="label-checkbox">' +
                        '<input type="checkbox" name="my-checkbox" value="' + data[i].idParche.toString() + '">' +
                        '<div class="item-media">' +
                        '<i class="icon icon-form-checkbox"></i>' +
                        '</div>' +
                        '</label>' +
                        '</div>' +
                        '</div>' +
                        '</li>';
                }
                myApp.closeModal();
                var popupHTML = '<div class="popup">' +
                    '<div class="navbar">' +
                    '<div class="navbar-inner">' +
                    '<div class="left"><a href="#" class="link icon-only close-popup" data-panel="left"><img src="img/icons/back.svg"></a></div>' +
                    '<div class="center">Invitar amigo a un parche</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="content-block">' +
                    '<div class="list-block">' +
                    '<ul style="margin-top: -33px;" id="lista_invitar_amigo"> ' +
                    template +
                    '</ul>' +
                    '</div>' +
                    '</div>' +
                    '<div class="toolbar toolbar-bottom fixed-popup-toolbar">' +
                    '<div class="toolbar-inner">' +
                    '<a href="#" class="link close-popup">Cancelar</a>' +
                    '<a href="#" class="link" onclick="app.agregarAmigo.agregar(' + id + ')">Agregar</a>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                myApp.popup(popupHTML);
            }, true);
        }
    },
    eliminarAmigo: function (id) {
        myApp.closeModal();
        myApp.confirm('Â¿Eliminar de tu lista de amigos?', 'Eliminar Amigo',
            function () {
                app.toServer("POST", { usuario: config.getPersonId(), usuarioEliminar: id }, "EliminarAmigo", function () {
                    myApp.alert('Se eliminado de tu lista de amigos', 'DeParche', function () {
                        app.cargarAmigos();
                    });
                }, true)
            }, function () {/*Si presiona cancelar*/ }
        );
    },
    notificaciones: {
        init: function () {
            app.notificaciones.cantida();
            // setInterval(function(){
            //     app.notificaciones.cantida();
            // }, 3000);
        },
        cantida: function () {
            app.toServer("POST", { usuario: config.getPersonId() }, "CargarNotificacionesUsuario", function (data) {
                $$("#lbl_num_notificaciones").text(data.cantidadNotificaciones);
            }, false)
        },
        obtener: function () {
            app.toServer("POST", { usuario: config.getPersonId() }, "CargarNotificacionesUsuario", function (data) {
                var lon_amigo = data.SolicitudesAmistad.length;
                var lon_evento = data.SolicitudesEventos.length;
                var lon_grupo = data.SolicitudesParches.length;
                var template = "";
                app.debug(data);
                if (lon_amigo == 0 && lon_evento == 0 && lon_grupo == 0) {
                    $("#content_notificaciones").html('<div class="card"><div class="card-content"><div class="card-content-inner">No tienes notificaciones pendientes.</div></div>');
                    return;
                }
                for (var i = 0; i < lon_amigo; i++) {
                    template += '<div class="card">\
                              <div class="card-content">\
                                <div class="card-content-inner">\
                                  <div>\
                                    <img class="circle_notification" src="'+ config.HOST + data.SolicitudesAmistad[i].urlImage + '"></img>\
                                  </div>\
                                  <div class="circle_notification_content">\
                                    <h5>Invitación de amistad.</h5>'
                        + data.SolicitudesAmistad[i].nombre + ' ' + data.SolicitudesAmistad[i].apellido +
                        ' quiere ser tu amigo.\
                                  </div>\
                                </div>\
                              </div>\
                              <div class="card-footer circle_card_footer">\
                                <p class="buttons-row circle_notification_button_container">\
                                  <div class="circle_notification_buttons button-fill">\
                                    <img src="img/icons/aceptar.svg"></img>\
                                    <a href="#" class="button" onclick="app.notificaciones.amistad(this.id, 1,'+ data.SolicitudesAmistad[i].idUsuarioEnvia + ')" id="' + data.SolicitudesAmistad[i].idSolicitud + '">\
                                      Aceptar\
                                    </a>\
                                  </div>\
                                  <div class="circle_notification_buttons">\
                                    <img src="img/icons/rechazar.svg"></img>\
                                    <a href="#" class="button" onclick="app.notificaciones.amistad(this.id, 0,'+ data.SolicitudesAmistad[i].idUsuarioEnvia + ')" id="' + data.SolicitudesAmistad[i].idSolicitud + '">\
                                      Rechazar\
                                    </a>\
                                  </div>\
                                </p> \
                              </div>\
                            </div>'
                }
                for (var i = 0; i < lon_evento; i++) {
                    template += '<div class="card">\
                                  <div class="card-content">\
                                    <div class="card-content-inner">\
                                      <div >\
                                        <img class="circle_notification" src="'+ config.HOST + data.SolicitudesEventos[i].urlImage + '"></img>\
                                      </div>\
                                      <div class="circle_notification_content">\
                                        <h5>'+ data.SolicitudesEventos[i].tituloEvento + '</h5>'
                        + data.SolicitudesEventos[i].nombreInvita +
                        ' te invitÃ³ a un evento el ' + config.parseFecha(data.SolicitudesEventos[i].fechaEvento) + ' en \
                                          '+ data.SolicitudesEventos[i].cliente + '.\
                                      </div>\
                                    </div>\
                                  </div>\
                                  <div class="card-footer circle_card_footer">\
                                    <p class="buttons-row circle_notification_button_container">\
                                      <div class="circle_notification_buttons button-fill">\
                                        <img src="img/icons/aceptar.svg"></img>\
                                        <a href="#" class="button" onclick="app.notificaciones.evento(this.id, 1)" id="'+ data.SolicitudesEventos[i].idInvitacion + '">\
                                          Aceptar\
                                        </a>\
                                      </div>\
                                      <div class="circle_notification_buttons">\
                                        <img src="img/icons/rechazar.svg"></img>\
                                        <a href="#" class="button" onclick="app.notificaciones.evento(this.id, 0)" id="'+ data.SolicitudesEventos[i].idInvitacion + '">\
                                          Rechazar\
                                        </a>\
                                      </div>\
                                    </p> \
                                  </div>\
                                </div>'
                }
                for (var i = 0; i < lon_grupo; i++) {
                    template += '<div class="card">\
                                  <div class="card-content">\
                                    <div class="card-content-inner">\
                                      <div >\
                                        <img class="circle_notification" src="'+ config.HOST + data.SolicitudesParches[i].urlImageGrupo + '"></img>\
                                      </div>\
                                      <div class="circle_notification_content">\
                                        <h5>Invitacion a grupo</h5>'
                        + data.SolicitudesParches[i].nombreInvita + ' ' + data.SolicitudesParches[i].apellidoInvita +
                        ' te invitÃ³ al grupo ' + data.SolicitudesParches[i].nombreGrupo + ' \
                                      </div>\
                                    </div>\
                                  </div>\
                                  <div class="card-footer circle_card_footer">\
                                    <p class="buttons-row circle_notification_button_container">\
                                      <div class="circle_notification_buttons button-fill">\
                                        <img src="img/icons/aceptar.svg"></img>\
                                        <a href="#" class="button" onclick="app.notificaciones.parche(this.id, 1,'+ data.SolicitudesParches[i].idGrupo + ')" id="' + data.SolicitudesParches[i].idInvitacion + '">\
                                          Aceptar\
                                        </a>\
                                      </div>\
                                      <div class="circle_notification_buttons">\
                                        <img src="img/icons/rechazar.svg"></img>\
                                        <a href="#" class="button" onclick="app.notificaciones.parche(this.id, 0,'+ data.SolicitudesParches[i].idGrupo + ')" id="' + data.SolicitudesParches[i].idInvitacion + '">\
                                          Rechazar\
                                        </a>\
                                      </div>\
                                    </p> \
                                  </div>\
                                </div>'
                }
                $("#content_notificaciones").html(template);
            }, true)
        },
        amistad: function (id, state, usu_envia) {
            var _aceptada = 0;
            var _rechazad = 0;
            if (state === 1) {
                _aceptada = 1;
            } else {
                _rechazad = 1;
            }
            var obj = { idSolicitud: id, aceptada: _aceptada, rechazada: _rechazad, usuarioEnvia: usu_envia, usuarioRecibe: config.getPersonId(), cancelada: 0 };
            //app.debug(obj);
            app.toServer("POST", obj, "AdministrarSolicitudAmistad", function (data) {
                app.debug(data)
                app.notificaciones.obtener();
                app.notificaciones.cantida();
            }, false)
        },
        parche: function (id, state, _grupo) {
            var _aceptada = 0;
            var _rechazad = 0;
            if (state === 1) {
                _aceptada = 1;
            } else {
                _rechazad = 1;
            }
            var obj = { idInvitacion: id, aceptada: _aceptada, rechazada: _rechazad, grupo: _grupo, usuarioRecibe: config.getPersonId(), cancelada: 0 };
            //app.debug(obj);
            app.toServer("POST", obj, "AdministrarInvitacionesParche", function (data) {
                app.debug(data)
                app.notificaciones.obtener();
                app.notificaciones.cantida();
            }, false);
        },
        evento: function (id, state) {
            var _aceptada = 0;
            var _rechazad = 0;
            if (state === 1) {
                _aceptada = 1;
            } else {
                _rechazad = 1;
            }
            var obj = { idSolicitud: id, aceptada: _aceptada, rechazada: _rechazad, cancelada: 0 };
            //app.debug(obj);
            app.toServer("POST", obj, "AdministrarInvitacioEvento", function (data) {
                app.debug(data)
                app.notificaciones.obtener();
                app.notificaciones.cantida();
            }, false);
        }
    },
    perfil: {
        pass: "",
        init: function () {
            $("form#profileinformationForm input").on("blur", function () {
                var person = myApp.formToJSON('#profileinformationForm');
                app.perfil.updatePersonInformation(person);
                return false;
            })
            $("form#profileinformationForm select").on("change", function () {
                var person = myApp.formToJSON('#profileinformationForm');
                app.perfil.updatePersonInformation(person);
            })
            $("form#profileinformationForm input[type='checkbox']").on("change", function () {
                var person = myApp.formToJSON('#profileinformationForm');
                app.perfil.updatePersonInformation(person);
            })
            var d = {
                usuario: config.getPersonId()
            }
            app.toServer('POST', d, "DetalleUsuario", function (data) {
                app.perfil.getPersonInformation(data.info);
            }, true)
        },
        getPersonInformation: function (person) {
            $.each(person, function (key, value) {
                $("input[name=" + key + "]").val(value);
                if (key == "password") {
                    app.perfil.pass = value;
                    $("input[name=contrasenia]").val(value);
                }
                $
                if (key == "recibirCorreos") {
                    $("input[name='recibirCorreos']").prop("checked", Boolean(value));
                }
                if (key == "genero") {
                    debugger;
                    var g;
                    switch (value) {
                        case "Hombre":
                            g = 1;
                            break;
                        case "Mujer":
                            g = 2;
                            break;
                        default:
                            g = 3;
                            break;
                    }
                    $("select[name='genero']").val(g);
                }
                if (key == "idCiudad") {
                    var template = "";
                    app.toServer("POST", {}, "ObtenerCiudades", function (data) {
                        $.each(data, function (key2, value2) {
                            template += "<option value='" + value2.idCiudad + "'>" + value2.nombreCiudad + "</option>"
                        })
                        $("select[name='ciudad']").empty();
                        $("select[name='ciudad']").append(template);
                        $("select[name='ciudad']").val(value);
                    })
                }
            })
            $("#imagenPerfil").attr("src", config.HOST + person.urlImagen)
        },
        updatePersonInformation: function (person) {
            debugger;
            var p = app.perfil.configInfoForSend(person);
            app.toServer('POST', p[0], "ActualizarInfoConfiguracion", function (data) {
                app.toServer('POST', p[1], "ActualizarInfoPersonal", function (data) {
                }, false)
            }, false)
        },
        configInfoForSend: function (person) {
            var d = [],
                user = parseInt(config.getPersonId());
            var c = {
                usuario: user,
                recibirCorreos: person.recibirCorreos.length > 0 ? 1 : 0,
                password: person.contrasenia,
                email: person.email,
                modificoPassword: app.perfil.pass != person.contrasenia.trim() != ""
            }
            app.perfil.pass = person.contrasenia.trim();
            var p = {
                usuario: user,
                nombre: person.nombre,
                apellido: person.apellido,
                fechaNacimiento: person.fechaNacimiento,
                numeroId: person.numeroIdentificacion,
                ciudad: person.ciudad,
                genero: parseInt(person.genero),
                numeroCelular: person.numeroCelular,
                lugarEstudio: person.lugarEstudio,
                lugarTrabajo: person.lugarTrabajo,
                direccion: person.dereccion,
                mensajePersonal: person.mensajePersonal
            }
            d.push(c);
            d.push(p);
            return d;
        }
    },
    addMemberToEvent: function (tipo) {
        var template = '<div class="chip">' +
            '<div class="chip-label">Example Chip</div>' +
            '<a href="#" class="chip-delete"></a>' +
            '</div>';
        $("#evento" + tipo).append(template);
    },
    programate: {
        datos: {},
        seleted: 0,
        parcheSeleted: [],
        amigoSeleted: [],
        init: function () {

            var canGeo = false;

            if (navigator.geolocation === undefined) {
                alert("No se puede obtener");
                return;
            }
            function geoError() {

                myApp.hidePreloader();
                app.alert("Ocurrio un error al intentar obtener tu ubicacion basada en la red");
                return false;
            }
            function geoSuccess(data) {
                //$$("#lbl_test").html(data.coords.latitude);
                var obj = { usuario: config.getPersonId(), latitud: data.coords.latitude, longitud: data.coords.longitude }
                app.debug(obj);
                app.toServer("POST", obj, "ListarEventosZona", function (result) {
                    app.programate.datos = result;
                    app.programate.draw();
                }, false)
                myApp.hidePreloader();
                canGeo = true;
            }
            myApp.showPreloader('Obteniendo ubicación...');

            navigator.geolocation.getCurrentPosition(geoSuccess, geoError);

            setTimeout(function () {//No se pudo obtener la ubicacion
                if (!canGeo) {
                    myApp.hidePreloader();
                    app.programate.getByCity();
                }
            }, 5000);
        },
        getByCity: function () {
            var obj = { usuario: config.getPersonId(), ciudad: config._get('ciudad') };
            app.toServer('POST', obj, 'ListarEventosCiudad', function (data) {
                app.programate.datos = data;
                app.programate.draw();
            }, true)
        },
        draw: function () {
            data = app.programate.datos;
            var lon = data.length;
            var template = "";
            for (var i = 0; i < lon; i++) {
                //app.debug(data[i].tituloEvento);
                template += '<li><a href="#detalleEvento?evento=' + i.toString() + '" class="item-link item-content"><div class="item-media imagen-parche"><img src="' + config.HOST + data[i].imageBanner + '" width="80" height="80"></div><div class="item-inner"><div class="item-title-row"><div class="item-title" id="lbl_test">' + data[i].tituloEvento + '</div><div class="item-after"></div></div><div class="item-subtitle"></div><div class="item-text">' + data[i].descripcionEvento + '</div></div></a></li>';
            }
            $$("#eventosListar").html(template);
        },
        detalle: function (e) {
            var page = e.detail.page;
            var id = page.query.evento;
            app.programate.seleted = id;
            app.debug(app.programate.datos[id]);
            $$("#img_programacion_detalle")[0].style.backgroundImage = "url(" + (config.HOST + app.programate.datos[id].imageBanner) + ")";
            $$("#lbl_titulo_programacion").text(app.programate.datos[id].tituloEvento);
            $$("#lbl_nombre_programacion").text(app.programate.datos[id].tituloEvento);
            $$("#lbl_direccion_programacion").text(app.programate.datos[id].direccion);
            $$("#btn_nuevo_evento")[0].href = "javascript:mainView.router.loadPage({ pageName: 'crearEvento' });";
            if (app.programate.datos[id].valorPagado != null) {
                if (app.programate.datos[id].valorPagado != 0) {
                    $$("#lbl_valor_programacion").text("$ " + app.programate.datos[id].valorPagado.toString().mask("###.###.###"));
                } else {
                    $$("#lbl_valor_programacion").text("Entrada libre");
                }
            } else {
                $$("#lbl_valor_programacion").text("Entrada libre");
            }

            $$("#lbl_web_programacion").text(app.programate.datos[id].sitioWeb);
            $$("#lbl_descripcion_programacion").text(app.programate.datos[id].descripcionEvento);
            if (app.programate.datos[id].tieneDescuento == 1) {
                $$("#lbl_descuento_programacion").text(app.programate.datos[id].descripcionDescuento);
            } else {
                $$("#lbl_descuento_programacion").text("Este evento no tiene descuentos");
            }
        },
        creaEvento: function () {
            var obj = {
                titulo: $$("#txt_titulo_creaprogramate").value(),
                descripcion: $$("#txt_descrip_crea_programate").value(),
                fecha: $$("#txt_fecha_crea_programate").value(),
                horaInicio: $$("#txt_hini_crea_programate").value(),
                horaFin: $$("#txt_hfin_crea_programate").value(),
                eventoCliente: app.programate.seleted,
                cliente: null,
                lugar: "",
                usuarioCreo: config.getPersonId(),
                grupos: app.programate.parcheSeleted,
                usuarios: app.programate.amigoSeleted,
                miembros: app.programate.obtenerMiembros()
            };
            app.toServer("POST", obj, "CrearEvento", function (data) {
                console.log(data);
                myApp.closeModal();
                mainView.router.back();
            }, true);
        },
        dataParche: {},
        cargarParches: function () {
            var template = '';
            app.toServer('POST', { usuario: config._get(app.constants.user_key) }, 'CargarParchesUsuario', function (data) {
                app.programate.dataParche = data;
                var lon = data.length;
                for (var i = 0; i < lon; i++) {
                    template += '<li class="item-content">' +
                        '<div class="item-media"><img src="' + (config.HOST + data[i].urlImage) + '" class="img-amigo"></div>' +
                        '<div class="item-inner">' +
                        '<div class="item-title">' + data[i].nombre + '</div>' +
                        '<div class="item-after">' +
                        '<label class="label-checkbox">' +
                        '<input type="checkbox" name="my-checkbox" value="' + data[i].idParche.toString() + '">' +
                        '<div class="item-media">' +
                        '<i class="icon icon-form-checkbox"></i>' +
                        '</div>' +
                        '</label>' +
                        '</div>' +
                        '</div>' +
                        '</li>';
                }
                myApp.closeModal();
                var popupHTML = '<div class="popup">' +
                    '<div class="navbar">' +
                    '<div class="navbar-inner">' +
                    '<div class="left"><a href="#" class="link icon-only close-popup" data-panel="left"><img src="img/icons/back.svg"></a></div>' +
                    '<div class="center">Invitar parche al evento</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="content-block">' +
                    '<div class="list-block">' +
                    '<ul style="margin-top: -33px;" id="lista_invitar_amigo"> ' +
                    template +
                    '</ul>' +
                    '</div>' +
                    '</div>' +
                    '<div class="toolbar toolbar-bottom" style="position:absolute;">' +
                    '<div class="toolbar-inner">' +
                    '<a href="#" class="link close-popup">Cancelar</a>' +
                    '<a href="#" onclick="app.programate.agregarParche()" class="link">Agregar</a>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                myApp.popup(popupHTML);
            }, true);
        },
        agregarParche: function () {
            var data = $("#lista_invitar_amigo")[0].getElementsByTagName("input");
            var lon = data.length;
            for (var i = 0; i < lon; i++) {
                if (data[i].checked) {
                    app.programate.parcheSeleted.push(data[i].value);
                }
                myApp.closeModal();
            }
        },
        cargarAmigos: function () {
            app.toServer("POST", { usuario: config.getPersonId() }, "ListarAmigos", function (data) {
                lon = data.length;
                template = "";
                for (var i = 0; i < lon; i++) {
                    template += '<li class="item-content"><div class="item-media"><img src="' + config.HOST + data[i].urlImagen + '" class="img-amigo" data-amigo="' + data[i].idUsuario + '"></img></div><div class="item-inner"><div class="item-title">' + data[i].nombreCompleto + '</div><div class="item-after">  <label class="label-checkbox"> <input type="checkbox" name="my-checkbox" value="' + data[i].idUsuario + '"><div class="item-media"><i class="icon icon-form-checkbox"></i></div></label> </div></div></li>';
                }
                myApp.closeModal();
                var popupHTML = '<div class="popup">' +
                    '<div class="navbar">' +
                    '<div class="navbar-inner">' +
                    '<div class="left"><a href="#" class="link icon-only close-popup" data-panel="left"><img src="img/icons/back.svg"></a></div>' +
                    '<div class="center">Invitar amigo a un evento</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="content-block">' +
                    '<div class="list-block">' +
                    '<ul style="margin-top: -33px;" id="lista_invitar_amigo"> ' +
                    template +
                    '</ul>' +
                    '</div>' +
                    '</div>' +
                    '<div class="toolbar toolbar-bottom" style="position:absolute;">' +
                    '<div class="toolbar-inner">' +
                    '<a href="#" class="link close-popup">Cancelar</a>' +
                    '<a href="#" class="link" onclick="app.programate.agregarAmigo();">Agregar</a>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                myApp.popup(popupHTML);
            }, true);
        },
        agregarAmigo: function () {
            var data = $("#lista_invitar_amigo")[0].getElementsByTagName("input");
            var lon = data.length;
            for (var i = 0; i < lon; i++) {
                if (data[i].checked) {
                    app.programate.amigoSeleted.push(data[i].value);
                }
                myApp.closeModal();
            }
        },
        obtenerMiembros: function () {
            var lon = app.programate.dataParche.length;
            var tot = "";
            for (var i = 0; i < lon; i++) {
                if (app.programate.parcheSeleted.indexOf(app.programate.dataParche[i].idParche) != -1) {
                    console.log(app.programate.dataParche[i].idParche);
                    tot += app.programate.dataParche[i].miembros + ",";
                }
            }
            tot = tot.replace(",,", ",");
            tot = tot.substring(0, tot.length - 1)
            tot = tot.split(",").unique();
            return tot;
        }
    },
    buscarAmigos: {
        init: function () {
            $$('.create-links-add-friend').on('click', function () {
                var action = "";
                if ($(this).data("estado")) {
                    myApp.addNotification({
                        message: 'La solicitud de amistad ya ha sido enviada.',
                        button: {
                            text: 'OK',
                            color: 'white'
                        },
                        hold: 2000
                    });
                } else {
                    action = '<li><a href="#" class="item-link list-button" onclick="app.buscarAmigos.agregarAmigo(' + $(this).data("friend") + ')">Agregar a mis amigos</li>';
                    var clickedLink = this;
                    var popoverHTML = '<div class="popover">' +
                        '<div class="popover-inner">' +
                        '<div class="list-block">' +
                        '<ul>' +
                        action +
                        '</ul>' +
                        '</div>' +
                        '</div>' +
                        '</div>'
                    myApp.popover(popoverHTML, clickedLink);
                }
            });
        },
        buscar: function (text) {
            if (text.length >= 2) {
                app.toServer('POST', { usuario: config.getPersonId(), texto: text }, "BuscarPersona", function (data) {
                    var _t = "";
                    if (data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i].persona;
                            _t += '<li class="item-content">' +
                                '<div class="item-media">' +
                                '<img src="' + config.HOST + item.urlImagen + '" class="img-amigo"></div>' +
                                '<div class="item-inner">' +
                                '<div class="item-title">' + item.nombreCompleto + '</div>' +
                                '<div class="item-after"><img src="img/icons/more.svg" class="create-links-add-friend" data-friend="' + item.idUsuario + '" data-estado="' + data[i].solicitud + '"></div>' +
                                '</div>'
                            '</li>';
                        }
                        $("#listaNuevosAmigos").html(_t);
                        app.buscarAmigos.init();
                    } else {
                        $("#listaNuevosAmigos").html('<div class="card" style="margin-top:36px;">' +
                            '<div class="card-content">' +
                            '<div class="card-content-inner">No se han encontrado coincidencias.</div>' +
                            '</div>' +
                            '</div>');
                    }

                }, false);
            }
        },
        agregarAmigo: function (id) {
            app.toServer('POST', { usuarioEnvia: config.getPersonId(), usuarioRecibe: id }, "EnviarSolicitudAmistad", function (data) {
                debugger;
                console.log(data);
                $("[data-friend=" + id + "]").data("estado", "true");
                $("[data-friend=" + id + "]").attr("data-estado", "true");
                $("[data-friend=" + id + "]").prop("data-estado", true);
                myApp.addNotification({
                    message: 'Solicitud de amistad enviada.',
                    button: {
                        text: 'OK',
                        color: 'white'
                    },
                    hold: 2000
                });
            }, false)
            myApp.closeModal();
        },
        cancelar: function (f) {
            $("#listaNuevosAmigos").html('<div class="card" style="margin-top:36px;">' +
                '<div class="card-content">' +
                '<div class="card-content-inner">Escribe en la parte superior para encontrar nuevos amigos.</div>' +
                '</div>' +
                '</div>');
            $("#searchFriends").val("")
            if (f) {
                mainView.router.back()
            }
        }
    },
    sendError: function (msg, file, line, col, error) {
        var data = {
            usuario: config.getPersonId(app.constants.user_key),
            mensaje: msg,
            vista: config.currentView.toString(),
            linea: "Linea: " + line + "/ Columna: " + col,
            error: error
        }
        app.toServer("POST", data, "ingresarLog", function (data) {
            console.log(data);
        }, false);
    }
}