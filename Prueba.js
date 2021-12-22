import AsyncStorage from "@react-native-async-storage/async-storage";

import BackendUrl from "../../constants/Urls";

export const LOGIN = "LOGIN";
export const AUTHENTICATE = "AUTHENTICATE";
export const LOGOUT = "LOGOUT";
export const SIGNUP = "SUGNUP";

let timer;

const saveDataToStorage = (expirationDate, name, status, token, userId) => {
  AsyncStorage.setItem(
    "userData",
    JSON.stringify({
      expiryDate: expirationDate.toISOString(),
      name: name,
      status: status,
      token: token,
      userId: userId,
    })
  );
};

export const authenticate = (expiresIn, name, status, token, userId) => {
  return (dispatch) => {
    dispatch(setLogoutTimer(expiresIn));
    dispatch({
      type: AUTHENTICATE,
      expiresIn: expiresIn,
      name: name,
      status: status,
      token: token,
      userId: userId,
    });
  };
};

export const login = (email, password) => {
  // For testing in server db
  // const emailto = "david_santos87@hotmail.com";
  // const passw = "Bbbbb";

  // For testing in local db
  const emailto = "david_santos87@hotmail.com";
  const passw = "Aaaaa";

  // UNCOMMENT FOR PRODUCTION
  // const emailto = email;
  // const passw = password;

  console.log(`${BackendUrl.baseUrl}/usuarios/login`)

  return async (dispatch) => {
    const response = await fetch(
      ${BackendUrl.baseUrl}/usuarios/login,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailto,
          password: passw,
        }),
      }
    );

    const resData = await response.json();

    console.log(resData)


    if (response.status !== 200) {
      const errorStatus = response.status;
      let message = "¡Ha ocurrido un error durante la autenticación!";
      if (errorStatus === 400) {
        message = "Constraseña incorrecta.";
      } else if (errorStatus === 401) {
        if( resData.error === "Activar cuenta por correo."){
          message = resData.error
        } else {
        message = "Cuenta no encontrada.";

        }
      } else if (errorStatus === 403) {
        message = "Cuenta no activada.";
      }
      throw new Error(message);
    }

    dispatch(
      authenticate(
        parseInt(resData.expiresIn) * 1000,
        resData.name,
        resData.status,
        resData.token,
        resData.userId
      )
    );

    const expirationDate = new Date(
      new Date().getTime() + parseInt(resData.expiresIn) * 1000
    );
    saveDataToStorage(expirationDate, resData.name, resData.status, resData.token, resData.userId);
  };
};

export const signUpUser = (user) => {
  return async (dispatch) => {
    const response = await fetch(
      ${BackendUrl.baseUrl}/usuarios/registrar?userMail=${user.email},
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: user.address,
          birthday: user.birthday,
          category: null,
          city: user.city,
          discount: null,
          email: user.email,
          lastNames: user.lastNames,
          names: user.names,
          password: user.password,
          phone1: user.phone1,
          phone2: user.phone2,
          province: user.province,
          ruc: user.ruc,
          sex: user.sex,
          _id: null,
        }),
      }
    );

    const respData = await response;

    if (response.status !== 201) {
      let message = "¡Ha ocurrido un error al crear la cuenta!";
      throw new Error(message);
    }
  };
};


export const resetPassword = (userEmail) => {
  return async (dispatch, getState) => {
    const response = await fetch(
      `${BackendUrl.baseUrl}/usuarios/restablecer-contrasena?userEmail=${userEmail}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: userEmail
        }),
      }
    );
    if (response.status !== 200) {
      let message = "¡Ha ocurrido un error al restablecer la contraseña";
      throw new Error(message);
    }
  };
};

export const logout = () => {
  if (timer) {
    clearTimeout(timer)
  }
  AsyncStorage.removeItem("userData");
  return {type: LOGOUT}

}

const setLogoutTimer = (expirationTime) => {
  return (dispatch) => {
    timer = setTimeout(() => {
      dispatch(logout());
    }, expirationTime);
  };
};
