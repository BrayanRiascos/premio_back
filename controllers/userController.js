const pool = require('../database/mongo')
const axios = require('axios');
const CryptoJS = require("crypto-js");
const { json } = require('express');
const moment = require('moment-timezone');



//---------------Login---------------------
const postLogin = async (req, res) => {
  const datos = req.body;
  //console.log("LOGIN: ", datos);
  const hashedPassword = CryptoJS.SHA256(datos.password, process.env.CODE_SECRET_DATA).toString();
  console.log("SIN ENCRIPTAR: ", datos.password);
  console.log("HACKEO: ", hashedPassword);
  try {
    const users = await pool.db('base_prueba').collection('usuarios').find().toArray()
    console.log("USERS: ", users);
    const login = await pool.db('base_prueba').collection('usuarios').findOne({ email: datos.email, pass: hashedPassword });
    console.log("datos.email: ", datos.email);
    console.log("pass: ", hashedPassword);
    console.log("login: ", login._id);
    if (login) {
      res.json({ status: "Bienvenido", user: datos.email, role: login.role, id: login._id });
    } else {
      res.json({ status: "ErrorCredenciales" });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};


//crear usuario
const crearusuario = async (req, res) => {
  const datos = req.body;

  if (datos.nombre === "" || datos.apellido === "" || datos.celular === "" || datos.email === ""
    || datos.documento === "" || datos.password === "" || datos.fechaNacimiento === "") {
      res.json({ status: "Rellene los espacios en blanco", });
    console.log("Rellene los espacios en blanco");
  } else {
   /* console.log("nombre: " + datos.nombre + " Apellido: " + datos.apellido + " Celular: " + datos.celular + " Cedula: " + datos.documento
      + " Email: " + datos.email + " contrasena: " + datos.password + " Fecha naciiento: " + datos.fechaNacimiento + " Role: " + datos.role)*/
      //verificar si ya existe
    const verificar = await pool.db('base_prueba').collection('usuarios').findOne({ email: datos.email });
    if (verificar) {
      res.json({ status: "Usuario ya se encuentra registrado",resultado: verificar });
      console.log("usuario ya se encuentra rtegistrado");
    } else {
      const hashedPassword = CryptoJS.SHA256(datos.password, process.env.CODE_SECRET_DATA).toString();
      await pool.db('base_prueba').collection('usuarios').insertOne({ email: datos.email, role: datos.role, pass: hashedPassword });
      const us = await pool.db('base_prueba').collection('usuarios').findOne({ email: datos.email });
      console.log("id:" + us._id);
      console.log("tipo usuario: " + datos.role)
      //insertar datos dependiendo de usuario
      if (datos.role === "user") {
        await pool.db('base_prueba').collection('usuario_info').insertOne({
          id_usuario: us._id, nombres: datos.nombre, apellidos: datos.apellido, fecha_nacimiento: datos.fechaNacimiento,
          celular: datos.celular, cedula: datos.documento
        });
      }
      res.json({ status: "Registro exitoso", datos_recibidos: "id: " + us._id + "email: " + datos.email + " password: " + datos.password + " role: " + datos.role })
      console.log("Usuario registrado con exito ");
    }
  }

}




const registrarcodigo = async (req, res) => {
  const { codigo } = req.body;
  const { userid } = req.params;
  if (codigo === "") {
    res.json({ status: "Ingrese un codigo" });
    console.log("ingrese codigo");
  } else {
    console.log("usuario: " + userid);
    console.log("codigo: " + codigo);
    let codigooEntero = parseInt(codigo, 10);
    let resultado = await pool.db('base_prueba').collection('codigos').findOne({ codigo: codigooEntero })
    const currentDateTime = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
    await pool.db('base_prueba').collection('intentos').insertOne({ user_id: userid, codigo: codigo, date: currentDateTime });
    console.log("id: ", userid);
    console.log("estadoo: " + resultado._id);
    let resultadousuario = await pool.db('base_prueba').collection('usuario_info').findOne({ id_usuario: '671ede80e361ce2d86187f43' })
    console.log("Nombre usuario: " + resultadousuario);
    if (resultado.estado != "") {
      console.log("codigo ya se encuentra registrado");
      res.json({ status: "codigo ya se encuentra registrado" });
    } else {
      if (resultado.premio != 0) {
        res.json({ status: "Ganaste", datos_obtenidos: resultado });
        console.log("ganaste")
      } else {
        res.json({ status: "No ganaste", datos_obtenidos: resultado })
      }
      actualizarcodigos(codigooEntero, userid);
    }
  }




}
const actualizarcodigos = async (codigo, nuevoEstado) => {
  const currentDateTime = moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss');
  try {
    const resultado = await pool.db('base_prueba').collection('codigos').updateOne(
      { codigo: codigo },           // Filtro: encuentra el documento con el código especificado
      { $set: { estado: nuevoEstado, fecha: currentDateTime } } // Actualización: establece el nuevo valor de 'estado'
    );
    if (resultado.matchedCount > 0) {
      console.log(`codigo se registro con exito`);
    } else {
      console.log("No se encontró ningún documento con ese código");
    }
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
  }
}


const leercodigos = async (req, res) => {
  const { userid } = req.params;
  console.log("leer estado:" + userid);
  let resultado = await pool.db('base_prueba').collection('codigos').find({ estado: userid }).toArray();
  

  res.json({ datos_obtenidos: resultado })
}


const leerganadores = async (req, res) => {
  let resultado = await pool.db('base_prueba').collection('codigos').find({
    estado: { $ne: "" },
    premio: { $ne: "" }
  }).toArray()
  console.log("obj ganados" + resultado);
  res.json({ datos_obtenidos: resultado })
}








module.exports = {
  postLogin,
  registrarcodigo,
  leercodigos,
  crearusuario,
  leerganadores
};
