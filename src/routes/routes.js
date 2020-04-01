const express = require("express");                       //Mando llamar a express
const router = express.Router();                          //Utilizo el motodo router de express
const passport = require('passport');                     //Mando llamar a passport completo
const moment = require('moment');                         //Mando a llamar a moment para poder dar formato a la fecha
const { Note, User } = require("../schema.js");           //De schema mando a utilizar los schemas Note y User

/*---------------- Ruta principal ----------------*/

router.get("/", function(req,res) {
    res.render("index.hbs");                              //Cuando el usuario inicialice la pagina web renderizara
});                                                       //a index.hbs junto con el main y los partials

router.get("/about", function(req,res) {
  res.render("about.hbs");                                //Cuando acceda a about renderizara
});                                                       //a about.hbs junto con el main y los partials


/*---------------- Rutas de notas ----------------*/

router.get("/add", function(req,res) {                    //Cuando el usuario acceda a add
  if(req.user)                                            //Y si esta logeado
    res.render("note.newnote.hbs");                       //Renderizara el formulario para agregar una nota
  else
    res.redirect("/");                                    ///En caso de no estar logeado redirecciona al inicio
});

router.post("/newnote", async function (req,res) {        //Cuando el usuario sea enviado a newnote desde el motodo POST
  const { title, description } = req.body;                //tomara los datos del body de donde fue enviado
  let errors = [];                                        //Inicializo un array vacio
  if (!title) {                                           //Si el usuario no escribio un titulo agrega este mensaje al array
    errors.push({ text: "Please Write a Title." });
  }
  if (!description) {                                     //Si el usuario no escribio una descripcion agrega este mensaje al array
    errors.push({ text: "Please Write a Description" });
  }
  if (errors.length > 0) {                                //Si hay mas de un error
    res.render("note.newnote.hbs", {                      //Renderiza de nueva cuenta new note, e inicializa estas tres
      errors,                                             //variables las cuales se mostraran en el formulario
      title,
      description
    });
  }else {
    let newNote = new Note({ title, description });       //En dado caso que el usuario si alla llenado el formulario OK inicializa un nueva schema y guardalo en newnote ya con los datos de title y description 
    newNote.user = req.user.id;                           //Asigno el valor del usuario logeado
    await newNote.save();                                 //Guarda este nuevo schema en la base de datos
    req.flash("success_msg", "Note Added Successfully");  //Utilizando flash lo mando a las var globals para que posteriormente renderice con partials el mensaje correspondiente
    res.redirect("/notes");                               //Redirecciono al usuario a la seccion donde estan todas las notas
  }
});

router.get("/notes", async function(req,res) {            //Cuando el usuario acceda a notes 
  if(req.user){                                           //Si el usuario esta logeado...
    let notes = await Note.find({user: req.user.id})      //Realizo una consulta a la base de datos para encontrar todo y lo almaceno en notes
    for(let i=0; i<notes.length; i++)                     //sobre escribo el formato para la fecha
      notes[i]['date'] = moment(notes[i]['date']).fromNow();  //utilizando la libreria de moment
    res.render("note.allnotes.hbs", { notes });           //Renderizo el formulario de all notes y le paso la variable notes para que imprima las tarjetas de cada una de las notas
  }else
    res.redirect("/");                                    //En caso de que el usuario no esta logeado sera redireccionado al inicio
});

router.get("/edit/:id",async (req, res) => {              //Si el usuario pulsa el boton de editar del formulario anterior este realizara lo siguiente:
  if(req.user){                                           //Si el usuario esta logeado...
    const note = await Note.findById(req.params.id);      //almaceno el id que se transfirio a travez de la URL para generar una consulta a la base de datos y buscar la fula correspondiente a ese id y lo almaceno en note
    res.render("note.editnote.hbs", { note });            //Renderizo el formulario de edit note y le paso el paraemtro de note
  }else
    res.redirect("/");                                    //En caso de que el usuario no esta logeado sera redireccionado al inicio
});

router.put("/editnote/:id", async function(req,res) {     //Si el usuario pulsa el boton de guardar del formulario anterior este realizara lo sifuiente:
  const { title, description } = req.body;                //Guardara el title y el description obtenidos a travez de body
  await Note.findByIdAndUpdate(req.params.id, { title, description });  //Realiza un update de la fila con el id
  req.flash("success_msg", "Note Updated Successfully");  //Utilizando flash lo mando a las var globals para que posteriormente renderice con partials el mensaje correspondiente
  res.redirect("/notes");                                 //Redirecciono al usuario a donde estan todas las notas
});

router.delete("/delete/:id",  async (req, res) => {       //Si el usuario pulsa el boton de eliminar del formulario de all notes
  await Note.findByIdAndDelete(req.params.id);            //Realizo una consulta del tipo eleminiar a la base de datos a traves de la fila con id de numero tal
  req.flash("success_msg", "Note Deleted Successfully");  //Utilizando flash lo mando a las var globals para que posteriormente renderice con partials el mensaje correspondiente 
  res.redirect("/notes");                                 //Redirecciono al usuario a donde estan todas las notas
});

/*---------------- Rutas de user ----------------*/

router.get("/signup", function(req,res) {                 //Si el usuario accede a la ruta sign up
  res.render("user.signup.hbs");                          //Renderiza el formulario para poder darse de alta
});

router.post("/signup", async function(req,res) {          //Si el usuario pulsa el boton de guardar del formulario anterior...
  let errors = [];                                        //Inicializo un array vacio para errores
  const { name, email, password, confirm_password } = req.body;   //Almaceno los datos correspondientes
  if (password != confirm_password) {                     //Si el password no e igual
    errors.push({ text: "Passwords do not match." });     //Manda un mensaje de error
  }
  if (password.length < 4) {                              //Si el password es menor a letras 
    errors.push({ text: "Passwords must be at least 4 characters." });
  }
  if (errors.length > 0) {                                //Si el array de error es mayor a 1
    res.render("user.signup.hbs", {                       //Renderiza el formulario con los datos y le mensaje de error
      errors,
      name,
      email,
      password,
      confirm_password
    });
  } else {                                                          //En dado caso de que no alla habido errores
    // Look for email coincidence
    const emailUser = await User.findOne({ email: email });         //Realizo una cosulta a la db a tracez del email
    if (emailUser) {                                                //Si el email ya esta en la base de datos
      req.flash("error_msg", "The Email is already in use.");       //Arrojo un horror
      res.redirect("/signup");                                      //Redirecciono a /signup
    } else {                                                        //En caso de que no exista el email
      // Saving a New User
      const newUser = new User({ name, email, password });          //Genero un nuevo User schema con los datos correspondientes
      newUser.password = await newUser.encryptPassword(password);   //Encripto el password
      await newUser.save();                                         //Almaceno el schema guardarndo una nueva fila en la tabla
      req.flash("success_msg", "You are registered.");              //Utilizando flash lo mando a las var globals para que posteriormente renderice con partials el mensaje correspondiente    
      res.redirect("/signin");                                      //Redirecciono al usuario al login
    }
  }
});

router.get("/signin", function(req,res) {                           //Si el usuario ingresa a logearse...
  res.render("user.signin.hbs");                                    //Renderiza el formulario signin
});

//revisar el local async function configurado en ./passport.js para entender el funcionamiento de esta ruta
router.post("/signin", passport.authenticate("local", {             //Si el usuario presiona el boton de login este manda llamar el metodo de autentificacion de passport, dicho metodo es un combinado de las 2 httas "passport", "passport-local" y la configuracion de ./passport.js
  successRedirect: "/notes",                                        //Si el metodo estuvo ok me redirecciona a notes y atravez de las variables globales asigna los datos del usuario indicadole a tosas las rutas que el usuario esta logeado
  failureRedirect: "/signin",                                       //Si el usuario no logro logearse ya que no existe se redirecciona a donde mismo
  failureFlash: true                                                //Si existe un error se coloca failure en true
}));

router.get("/logout",function (req,res) {                           //Si el usuario pulsa el boton logout...
  req.logout();                                                     //Utilizo el motodo de passport para deslogear
  req.flash("success_msg", "You are logged out now.");              //A travez de las variables globales aviso que el usuario se deslogeo
  res.redirect("/signin");                                          //Se redirecciona la pagina a sign in
})

module.exports = router;                                            //Exporto todas las rutas a backend.js

