import { AuthPage, ThemedTitle } from "@refinedev/antd";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      title={
        <ThemedTitle
          title="My Title"
          icon={<img src="https://refine.dev/img/logo.png" />}
        />
      }
      formProps={{
        initialValues: { email: "", password: "" },
      }}
    />
  );
};
