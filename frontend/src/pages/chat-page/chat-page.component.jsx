/** @format */

import React, { Component } from 'react';
import './chat-page.styles.scss';

import { Input, PageHeader, List, Layout, Menu, Button } from 'antd';
import { UserOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';

import { connect } from 'react-redux';

import { setCurrentUser } from '../../redux/user/user.actions';
import { withRouter } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import { selectCurrentUser } from '../../redux/user/user.selector';

import { apiUrl, socketUrl } from '../../config/config.json';

import { io } from 'socket.io-client';

const { Search } = Input;
const { Header, Sider, Content } = Layout;

let socket;

class ChatPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentMessage: '',
            messages: [],
            collapsed: false,
            users: [],
            userTo: null,
        };
    }

    componentDidMount = () => {
        const { currentUser } = this.props;

        const requestOptions = {
            method: 'GET',
            headers: { Authorization: `Bearer ${currentUser.tokens.access.token}` },
        };

        fetch(apiUrl + '/users', requestOptions)
            .then(async response => {
                const data = await response.json();

                if (!response.ok) {
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }

                socket = io(socketUrl, { query: `chatID=${currentUser.user.id}&token=${currentUser.tokens.access.token}` });

                const userTo = data.results[0].id;

                this.setState({
                    users: data.results,
                    userTo,
                });
            })
            .catch(error => {
                this.setState({ errorMessage: error.toString() });
                alert('Error: ' + error + '. Please try refreshing or logging in again.');
            });
    };

    handleChange = event => {
        const { value, name } = event.target;

        this.setState({ [name]: value });
    };

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    handleChatSwitch = userId => {
        const { currentUser } = this.props;

        const requestOptions = {
            method: 'GET',
            headers: { Authorization: `Bearer ${currentUser.tokens.access.token}` },
        };

        fetch(apiUrl + `/messages?userId=${currentUser.user.id}&toId=${userId}`, requestOptions)
            .then(async response => {
                const data = await response.json();

                // check for error response
                if (!response.ok) {
                    // get error message from body or default to response status
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }

                const messages = data && data.length ? data : [];

                this.setState(
                    {
                        messages,
                        userTo: userId,
                    },
                    () => {
                        console.log(this.state);
                        const { messages, userTo } = this.state;
                        socket.on('receive_message', message => {
                            if (message.senderChatID === userTo) {
                                messages.push(message);

                                this.setState({
                                    messages,
                                });
                            }
                        });
                    }
                );
            })
            .catch(error => {
                this.setState({ errorMessage: error.toString() });
                alert('Error: ' + error);
            });
    };

    handleSubmit = () => {
        const { currentMessage, userTo, messages } = this.state;
        const { currentUser } = this.props;

        const message = {
            receiverChatID: userTo,
            senderChatID: currentUser.user.id,
            text: currentMessage,
            from: currentUser.user.name,
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentUser.tokens.access.token}`,
            },
            body: JSON.stringify(message),
        };

        fetch(apiUrl + '/messages', requestOptions)
            .then(async response => {
                const data = await response.json();

                // check for error response
                if (!response.ok) {
                    // get error message from body or default to response status
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }

                messages.push(message);
                this.setState({
                    messages,
                    currentMessage: '',
                });
                socket.emit('send_message', message);
            })
            .catch(error => {
                this.setState({ errorMessage: error.toString() });
                alert('Error: ' + error);
            });
    };

    render() {
        const { currentMessage, messages, users } = this.state;
        const { history, currentUser } = this.props;

        const data = messages;

        return (
            <div className='chat-page'>
                <div className='page-header'>
                    <PageHeader
                        className='site-page-header'
                        title='Chat App'
                        subTitle={currentUser.user.name}
                        extra={[
                            <Button
                                key='1'
                                onClick={() => {
                                    history.push('/annotation-rooms');
                                }}
                            >
                                Annotations
                            </Button>,
                            <Button
                                key='2'
                                onClick={() => {
                                    localStorage.removeItem('persist:gsoc-challenge-chat-app');
                                    window.location.reload();
                                }}
                            >
                                Logout
                            </Button>,
                        ]}
                        onBack={() => {
                            history.goBack();
                        }}
                    />
                    ,
                </div>
                <Layout className='messages-layout'>
                    <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
                        <div className='logo' />
                        <Menu theme='dark' mode='inline' className='users-list' defaultSelectedKeys={null}>
                            {users.map((user, i) =>
                                user.id !== currentUser.user.id ? (
                                    <Menu.Item
                                        key={i}
                                        onClick={() => {
                                            this.handleChatSwitch(user.id);
                                        }}
                                        icon={<UserOutlined />}
                                    >
                                        {user.name}
                                    </Menu.Item>
                                ) : null
                            )}
                        </Menu>
                    </Sider>
                    <Layout className='site-layout'>
                        <Header className='site-layout-background' style={{ padding: 0 }}>
                            {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                className: 'trigger',
                                onClick: this.toggle,
                            })}
                        </Header>
                        <Content
                            className='site-layout-background'
                            style={{
                                margin: '24px 16px',
                                padding: 24,
                                minHeight: 280,
                            }}
                        >
                            <List
                                className='messages-div'
                                itemLayout='horizontal'
                                dataSource={data}
                                renderItem={item => (
                                    <List.Item
                                        className={
                                            item.senderChatID === currentUser.user.id ? 'message-ours' : 'message-other'
                                        }
                                    >
                                        <List.Item.Meta
                                            title={
                                                <>
                                                    {' '}
                                                    {item.from} <UserOutlined />{' '}
                                                </>
                                            }
                                            description={item.text}
                                        />
                                    </List.Item>
                                )}
                            />
                        </Content>
                    </Layout>
                </Layout>
                <div className='form'>
                    <Search
                        className='chat-input'
                        placeholder='Enter your message'
                        allowClear
                        value={currentMessage}
                        enterButton='Submit'
                        size='large'
                        name='currentMessage'
                        onChange={this.handleChange}
                        onSearch={this.handleSubmit}
                    />
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

const mapStateToProps = createStructuredSelector({
    currentUser: selectCurrentUser,
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChatPage));
