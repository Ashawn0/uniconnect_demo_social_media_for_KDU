import AuthForm from '../AuthForm'

export default function AuthFormExample() {
  return (
    <AuthForm
      onLogin={(username, password) => console.log('Login:', { username, password })}
      onRegister={(username, password) => console.log('Register:', { username, password })}
    />
  )
}
