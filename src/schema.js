const mongoose = require('mongoose');                     //Mando a llamar a mongoose para poder utilizar la DB
const bcrypt = require("bcryptjs");                       //Mando a llamar bcrypt para poder cifrar passwords
const { Schema } = mongoose;                              //De mongoose mando a llamar a Schema para poder crear una tabla

const NoteSchema = new Schema(                            //Creo una tabla de nombre NoteSchema
  {
    title: {  type: String,  required: true },            //Creo una columna llamada title de tipo string
    description: {  type: String, required: true  },      //Creo una columna llamada description
    user: { type: String, required: true}                 //Creo una columna llamada user
  },
  { timestamps: true  }                                   //Creo las columnas del time stamp
);

const UserSchema = new Schema({                           //Creo una tabla de nombre UserSchema
  name: { type: String, required: true },                 //Creo una columna llamada name
  email: { type: String, required: true },                //Creo una columna llamada email
  password: { type: String, required: true },             //Creo una columna llamada password
  date: { type: Date, default: Date.now }                 //Creo una columna llamada date
});

UserSchema.methods.encryptPassword = async function(password) {  //Creo un metodo asyncrono para encriptar el password
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

UserSchema.methods.matchPassword = async function(password) {   //Creo un meotod asyncrono para comparar el password
  return await bcrypt.compare(password, this.password);
};

module.exports.Note = mongoose.model("Note", NoteSchema); //Exporto a Note
module.exports.User = mongoose.model("User", UserSchema); //Exporto a User