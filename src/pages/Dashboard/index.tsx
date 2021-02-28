import React, {FormEvent, useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

import api from '../../services/api';
import logoImg from '../../assets/logo.svg';
import { Form, Title, Repositories, Error } from './styles';

interface Repository {
    full_name: string;
    description: string;
    owner: {
        login: string;
        avatar_url: string; 
    }
}

const Dashboard: React.FC = () => {
    const [inputError, setInputError] = useState('');
    const [newRepository, setNewRepository] = useState('');
    const [repositories, setRepositories] = useState<Repository[]>(() => {
        const storageRepositories = localStorage.getItem('@GithubExplorer:repositories');

        if(storageRepositories) {
            return JSON.parse(storageRepositories);
        }
        
        return [];
    });

    useEffect(() => {
        localStorage.setItem('@GithubExplorer:repositories', 
                             JSON.stringify(repositories));
    }, [repositories]);

    async function handleAddRespository(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if(!newRepository) {
            setInputError('Digite o autor/nome do repositório.');
            return;
        }

        try {
            const response = await api.get<Repository>(`repos/${newRepository}`);

            const repository = response.data;
    
            setRepositories([...repositories, repository]);
            setNewRepository('');
            setInputError('');
        } catch (err) {
            setInputError('Erro na busca por esse repositório');
        }
    }

    return (
        <>
           <img src={logoImg} alt="Gitbub explorer"/>
           <Title>Explore repositórios no Github</Title> 

           <Form hasError={!!inputError} onSubmit={handleAddRespository}>
               <input value={newRepository}
                      onChange={ (e) => setNewRepository(e.target.value)}
                      placeholder="Digite o nome do repositório" />
               <button type="submit">Pesquisar</button>
           </Form>

           {inputError && <Error>{inputError}</Error>}

           <Repositories>
               {repositories.map( repository => (
                   <Link key={repository.full_name} to={`/repositories/${repository.full_name}`}>
                    <img src={repository.owner.avatar_url} 
                         alt={repository.owner.login}/>

                    <div>
                        <strong>{repository.full_name}</strong>
                        <p>{repository.description}</p>
                    </div>

                    <FiChevronRight size={20} />
                   </Link>
               ))}
           </Repositories>
        </>
    );
};

export default Dashboard;