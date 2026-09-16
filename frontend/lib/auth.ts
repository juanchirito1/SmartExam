export function guardarToken(token:string){
  localStorage.setItem(
    "token",
    token
  );
}

export function obtenerToken(){
  return localStorage.getItem(
    "token"
  );
}