/** @format */

import React, { Component } from 'react';
import './rooms.styles.scss';

import { Select, PageHeader, Button, Modal, Input, Empty } from 'antd';
// import { Input, PageHeader, List, Layout, Menu, Button } from 'antd';
// import { UserOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';

import { connect } from 'react-redux';

import { setCurrentUser } from '../../redux/user/user.actions';
import { withRouter } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import { selectCurrentUser } from '../../redux/user/user.selector';

import { apiUrl } from '../../config/config.json';

const { Option } = Select;

class RoomPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomName: '',
            isModalVisible: false,
            userlist: [],
            selectedUsers: [],
            roomslist: [],
        };
    }

    componentDidMount = () => {
        const { currentUser } = this.props;
        let userlist = [];
        let roomslist = [];

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.tokens.access.token}`,
        };

        fetch(apiUrl + '/users', { headers })
            .then(async response => {
                const data = await response.json();

                if (!response.ok) {
                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }

                data.results.forEach(user => {
                    if (user.id !== currentUser.user.id) {
                        userlist.push(<Option key={user.id}>{user.name}</Option>);
                    }
                });

                this.setState({ userlist });
            })
            .catch(error => {
                this.setState({ errorMessage: error.toString() });
                console.error('Error!: ', error);
            });

        fetch(apiUrl + `/rooms/getRooms/${currentUser.user.id}`, { headers })
            .then(async response => {
                const data = await response.json();

                if (!response.ok) {
                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }

                roomslist = data;
                this.setState({
                    roomslist,
                });
            })
            .catch(error => {
                this.setState({ errorMessage: error.toString() });
                console.error('Error!: ', error);
            });
    };

    showModal = () => {
        this.setState({
            isModalVisible: true,
        });
    };

    handleSelectChange = value => {
        this.setState({
            selectedUsers: [...value],
        });
    };

    handleSubmit = () => {
        const { selectedUsers, roomName, roomslist } = this.state;
        const { currentUser } = this.props;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentUser.tokens.access.token}`,
            },
            body: JSON.stringify({
                name: roomName,
                userlist: selectedUsers,
                createdBy: currentUser.user.id,
            }),
        };

        fetch(apiUrl + '/rooms', requestOptions)
            .then(async response => {
                const data = await response.json();

                if (!response.ok) {
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }

                roomslist.push(data);

                this.setState({
                    roomslist,
                });
            })
            .catch(error => {
                this.setState({ errorMessage: error.toString() });
                alert('Error!: ', error);
            });

        this.setState({
            isModalVisible: false,
        });
    };

    handleCancel = () => {
        this.setState({
            isModalVisible: false,
        });
    };

    handleChange = event => {
        const { value, name } = event.target;

        this.setState({ [name]: value });
    };

    handleRedirect = (roomName, roomId) => {
        const { history } = this.props;

        window.localStorage.setItem('roomName', roomName);
        window.localStorage.setItem('currentRoomId', roomId);
        history.push('/dragdrop');
    };

    render() {
        const { roomName, isModalVisible, userlist, selectedUsers, roomslist } = this.state;
        const { history, currentUser } = this.props;

        const rooms = [];
        if (roomslist.length > 0) {
            roomslist.forEach(room => {
                rooms.push(
                    <div className='rooms' onClick={() => this.handleRedirect(room.name, room.id)}>
                        {room.name}
                    </div>
                );
            });
        }

        return (
            <div className='room-page'>
                <div className='page-header'>
                    <PageHeader
                        className='site-page-header'
                        title='Chat App'
                        subTitle={currentUser.user.name}
                        extra={
                            currentUser.user.role === 'admin'
                                ? [
                                      <Button key='1' shape='round' onClick={this.showModal}>
                                          Create New Room
                                      </Button>,
                                      <Button
                                          key='2'
                                          type='primary'
                                          onClick={() => {
                                              history.push('/annotation-rooms');
                                          }}
                                      >
                                          Annotations
                                      </Button>,
                                      <Button
                                          key='3'
                                          onClick={() => {
                                              localStorage.removeItem('persist:gsoc-challenge-chat-app');
                                              window.location.reload();
                                          }}
                                      >
                                          Logout
                                      </Button>,
                                  ]
                                : [
                                      <Button
                                          key='1'
                                          onClick={() => {
                                              localStorage.removeItem('persist:gsoc-challenge-chat-app');
                                              window.location.reload();
                                          }}
                                      >
                                          Logout
                                      </Button>,
                                  ]
                        }
                        onBack={() => {
                            history.goBack();
                        }}
                    />
                    ,
                </div>
                <div className='content'>
                    <div className='rooms-collection'>
                        {roomslist && roomslist.length > 0 ? rooms : <Empty description={'No rooms to show'} />}
                    </div>
                </div>
                <Modal title='Basic Modal' visible={isModalVisible} onOk={this.handleSubmit} onCancel={this.handleCancel}>
                    <h2>Create a new room for annotations</h2>
                    <Input
                        placeholder='Enter name of the Room'
                        name='roomName'
                        value={roomName}
                        onChange={this.handleChange}
                        style={{ marginBottom: '10px' }}
                    />
                    <Select
                        mode='multiple'
                        allowClear
                        style={{ width: '100%' }}
                        value={selectedUsers}
                        placeholder='Please select the admitted users'
                        onChange={this.handleSelectChange}
                    >
                        {userlist}
                    </Select>
                </Modal>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RoomPage));
