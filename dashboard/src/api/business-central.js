import httpntlm from "httpntlm";

export const getHashedPassword = (password) => {
  var lm = JSON.stringify(
    Array.prototype.slice.call(
      httpntlm.ntlm.create_LM_hashed_password(password),
      0
    )
  );
  var nt = JSON.stringify(
    Array.prototype.slice.call(
      httpntlm.ntlm.create_NT_hashed_password(password),
      0
    )
  );
  return { lm, nt };
};
