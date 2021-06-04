import React, { ChangeEvent, useState } from "react";
import { useHistory } from 'react-router-dom';
import { useAuth } from "../../hooks/auth";

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const auth = useAuth();
    const history = useHistory();

    const onChangeEmail = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

    const onChangeSenha = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }

    const onSubmit = async (e: React.SyntheticEvent) => {
		e.preventDefault();

		try {
			await auth.singIn({ email, password });
			console.log('Usuario logado');
			history.push('/');
		} catch (err) {
			console.error(err);
		}
    }

    return (
        <div style={{ width: '400px', height: '500px' }}>
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <h1>Login</h1>
                <input name="Email" placeholder="Email" value={email} type="email" required onChange={onChangeEmail} />
                <input name="Senha" placeholder="Senha" value={password} type="password" required onChange={onChangeSenha} />
                <button type="submit">Logar</button>
            </form>
        </div>
    )
}

export default Login;
