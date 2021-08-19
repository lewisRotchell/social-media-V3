import { UserInput } from "../resolvers/UserInput";

export const validateRegister = (options: UserInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid Email",
      },
    ];
  }

  if (options.password.length <= 3) {
    return [
      {
        field: "password",
        message: "Length must be greater than 3",
      },
    ];
  }
  return null;
};
