export const hasSession = () => {
  return sessionStorage.getItem("auth_session") === "true";
};

export const setSession = (value: boolean) => {
  if (value) {
    sessionStorage.setItem("auth_session", "true");
  } else {
    sessionStorage.removeItem("auth_session");
  }
};