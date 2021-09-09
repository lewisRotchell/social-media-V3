import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { MeDocument, MeQuery, useLoginMutation } from "../generated/graphql";
import { InputField } from "../InputField";
// import { setAccessToken } from "../utils/accessToken";
import { useAccessToken } from "../context/AccessTokenProvider";
import { toErrorMap } from "../utils/toErrorMap";

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const [login] = useLoginMutation();
  const [accessToken, setAccessToken] = useAccessToken();
  return (
    <div>
      Login Page
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({
            variables: {
              email: values.email,
              password: values.password,
            },
            //This updates the cache
            update: (store, { data }) => {
              if (!data) {
                return null;
              }
              store.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  me: data.login.user,
                },
              });
            },
          });
          console.log(response);

          if (response && response.data) {
            setAccessToken(response.data.login.accessToken!);
          }

          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          }
          if (response.data?.login.user) {
            //It Worked
            history.push("/");
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
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};
