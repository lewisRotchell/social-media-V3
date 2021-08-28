import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { useRegisterMutation } from "../generated/graphql";
import { InputField } from "../InputField";
import { toErrorMap } from "../utils/toErrorMap";

export const Register: React.FC<RouteComponentProps> = ({ history }) => {
  const [register] = useRegisterMutation();
  return (
    <div>
      Register Page
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({
            variables: {
              email: values.email,
              password: values.password,
            },
          });
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          }
          if (response.data?.register.user) {
            //It Worked
            history.push("/dashboard");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="email" placeholder="email" label="email" />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
              mt={4}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
