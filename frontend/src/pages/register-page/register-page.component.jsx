/** @format */

import React, { Component } from 'react';
import './register-page.styles.scss';

import { apiUrl } from '../../config/config.json';

import { Input, Button, PageHeader } from 'antd';
import { UserOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { connect } from 'react-redux';

import { setCurrentUser } from '../../redux/user/user.actions';
import { withRouter } from 'react-router-dom';

class RegisterPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            password: '',
        };
    }

    handleChange = event => {
        const { value, name } = event.target;

        this.setState({ [name]: value });
    };

    handleSubmit = () => {
        const { setCurrentUser, history } = this.props;
        const { name, email, password } = this.state;

        const data = {
            name,
            email,
            password,
        };

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };

        fetch(apiUrl + '/auth/register', requestOptions)
            .then(async response => {
                const data = await response.json();

                // check for error response
                if (!response.ok) {
                    // get error message from body or default to response status
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }
                setCurrentUser(data);
                history.push('/chat');
            })
            .catch(error => {
                this.setState({ errorMessage: error.toString() });
                alert('Error: ' + error);
                // console.error('There was an error!', error);
            });
    };

    render() {
        const { name, email, password } = this.state;
        const { history } = this.props;

        return (
            <div className='register-page'>
                <div className='page-header'>
                    <PageHeader className='site-page-header' title='Chat App' subTitle='Register' />,
                </div>
                <div className='form'>
                    <Input
                        name='name'
                        size='large'
                        className='name-input'
                        placeholder='Enter your name'
                        prefix={<UserOutlined />}
                        value={name}
                        onChange={this.handleChange}
                    />
                    <Input
                        name='email'
                        size='large'
                        className='email-input'
                        placeholder='Enter your email address'
                        prefix={<UserOutlined />}
                        value={email}
                        onChange={this.handleChange}
                    />
                    <Input.Password
                        className='password-input'
                        size='large'
                        placeholder='Enter your password'
                        iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        onChange={this.handleChange}
                        name='password'
                        value={password}
                    />
                    <Button
                        type='link'
                        className='login-link'
                        onClick={() => {
                            history.push('/');
                        }}
                        block
                    >
                        Login?
                    </Button>
                    <Button type='primary' size='large' block onClick={this.handleSubmit}>
                        Register
                    </Button>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setCurrentUser: user => {
            dispatch(setCurrentUser(user));
        },
    };
};

export default withRouter(connect(null, mapDispatchToProps)(RegisterPage));
