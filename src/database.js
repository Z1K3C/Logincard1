const mongoose = require('mongoose');                           //Mando llamar al modulo mongoose para poder
                                                                //utilizar metodos de conexion a DBs de mongodb
mongoose.connect('mongodb://localhost/notesdb',{             //Utilizo connect con la URL, si la tabla no existe
  useNewUrlParser: true,                                        //se crea despues del localhost/"nombredelatabla"
  useUnifiedTopology: true,
  useFindAndModify: false 
}).catch(function (err) { console.log('error',err.message)})   //Mediante promesa si regresa un error lo imprime
  .then(function (db) { console.log('DBconnected') });         //En caso contrario imprime un mensaje
  