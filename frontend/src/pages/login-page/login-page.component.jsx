/** @format */

import React, { Component } from 'react';
import './login-page.styles.scss';

import { apiUrl } from '../../config/config.json';

import { Input, Button, PageHeader } from 'antd';
import { UserOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { connect } from 'react-redux';

import { setCurrentUser } from '../../redux/user/user.actions';
import { withRouter } from 'react-router-dom';

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
        const { email, password } = this.state;

        const data = {
            email,
            password,
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };

        fetch(apiUrl + '/auth/login', requestOptions)
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
                console.error('Error: ', error);
            });
    };

    render() {
        const { email, password } = this.state;
        const { history } = this.props;

        return (
            <div className='login-page'>
                <div className='page-header'>
                    <PageHeader className='site-page-header' title='Chat App' subTitle='Login' />,
                </div>
                <div className='form'>
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
                        className='register-link'
                        onClick={() => {
                            history.push('/register');
                        }}
                        block
                    >
                        Register?
                    </Button>
                    <Button type='primary' size='large' block onClick={this.handleSubmit}>
                        Login
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

export default withRouter(connect(null, mapDispatchToProps)(LoginPage));
