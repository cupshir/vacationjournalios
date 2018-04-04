import React, { Component } from "react";
import { 
    View, 
    StyleSheet,
    FlatList,
    Modal,
    TextInput,
    TouchableOpacity,
    Switch,
    AlertIOS
} from "react-native";
import { 
    FormLabel, 
    FormInput,
    FormValidationMessage,
    Text
} from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import uuid from 'react-native-uuid';
import DatePicker from 'react-native-datepicker';
import { RNCamera } from 'react-native-camera';

import {
    currentUser,
    parkRealm,
    getJournalById,
    saveJournal
} from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';


class EditJournal extends Component {
    static navigatorButtons = {
        rightButtons: [
            {
                title: 'Done',
                id: 'done'
            }
        ]
    };

    constructor(props) {
        super(props);
        this.state = { 
            currentUser: null,
            parks: [],
            parks_checked: [],
            formValues: {
                id: '',
                name: '',
                photo: '',
                description: '',
                startDate: '',
                endDate: '',
                parks: [],
                photo: '',
                createdDate: '',
                owner: ''                                                             
            },
            formErrors: {
                name: '',
                date: '',
                parks: ''
            },
            cameraConfig: {
                cameraType: RNCamera.Constants.Type.back
            },
            cameraModalVisible: false,
            isLoading: false,
            isEdit: false
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation event
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.updateCurrentUserInState(currentUser);
            if (this.props.journalId) {
                // get journal
                getJournalById(this.props.journalId).then((journal) => {
                    // success - pass journal entry to edit screen
                    this.loadJournalIntoState(journal);
                }).catch((error) => {
                    // failed
                    console.log('error: ', error);
                });
            } else {
                this.setState({
                    ...this.state,
                    isLoading: false
                })
            }
        }
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'done') {
                this.handleDone();
            } 
        }
    }

    componentWillMount() {
        let newParks = [];

        const parks = parkRealm.objects('Park');

        parks.forEach((park) => {
            park.checked = false;
            newParks.push(park);           
        });

        this.setState({
            ...this.state,
            parks: newParks
        });
        
    }

    componentDidMount() {
        this.props.navigator.setStyle({
            navBarNoBorder: false
        })
    }

    loadJournalIntoState= (journal) => {
        if (journal) {
            this.setState({
                ...this.state,
                formValues: {
                    id: journal.id,
                    name: journal.name,
                    startDate: journal.startDate,
                    endDate: journal.endDate,
                    parks: journal.parks,
                    photo: journal.photo,
                    createdDate: journal.dateCreated,
                    owner: journal.owner                                                             
                },
                isLoading: false,
                isEdit: true
            })

        }
    }

    updateCurrentUserInState = (user) => {
        if (user) {
            this.setState({
                ...this.state,
                currentUser: user
            });
        } else {
            this.setState({
                ...this.state,
                currentUser: null
            });
        }
    }

    // set camera modal visible
    setCameraModalVisible(visible) {
        this.setState({
            ...this.state,
            cameraModalVisible: visible
        });
    }

    toggleCameraType = () => {
        this.setState({
            ...this.state,
            cameraConfig: {
                type: (this.state.cameraConfig.type === RNCamera.Constants.Type.back) ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back
            }
        })
    }

    // handle photo change
    handlePhotoChange = async function() {
        if (this.camera) {
            const options = { 
                quality: .5,
                base64: true 
            };
            this.camera.takePictureAsync(options).then((data) => {
                this.setState({
                    formValues: {
                        ...this.state.formValues,
                        photo: data.base64
                    }
                });
            }).catch((error) => {
                console.log('something failed saving photo');
            })
        }
        this.setCameraModalVisible(false);
    }

    // row delete press event
    onPhotoDeletePress = () => {
        // display confirm prompt, user must type CONFIRM to delete
        AlertIOS.prompt(
            'Confirm Delete',
            'Type CONFIRM (all caps) to proceed with deletion',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    onPress: (enteredText) => this.handleDeletePhoto(enteredText)
                }
            ]
        );
    }

    handleDeletePhoto = (enteredText) => {
        if (enteredText === 'CONFIRM') {
            this.setState({
                formValues: {
                    ...this.state.formValues,
                    photo: ''
                }
            });
        } else {
            AlertIOS.alert('Incorrect CONFIRM text entered. Photo not deleted!')
        }

    }

    // handle save event
    handleDone = () => {
        this.updateSelectedParks();

        // Check if ready to submit
        const ready = this.readyForSubmit(this.state.formValues);

        if(ready) {
            const submitValues = this.prepareValuesForDB(this.state.formValues);

            saveJournal(submitValues, this.state.isEdit).then((journal) => {
                // Success - stop animation
                this.setState({
                    ...this.state,
                    isLoading: false
                });
                // Navigate back to journal screen
                this.props.navigator.push({
                    screen: 'vacationjournalios.Journal',
                    title: journal.name,
                    animated: true,
                    animationType: 'fade'
                });
            }).catch((error) => {
                // Failed - stop animation
                this.setState({
                    ...this.state,
                    isLoading: false
                });
            });
        } else {
            AlertIOS.alert('Missing Name, Start Date, or End Date');
        }        
    }

    // Updated selected parksin state
    updateSelectedParks = () => {
        let parksError = (this.state.formErrors.parks !== '') ? this.state.formErrors.parks : '';
        let selectedParks = (this.state.formErrors.parks.length !== 0) ? this.state.formValues.parks : [];

        // loop through parks in state and if checked is true, add to selectedParks array
        this.state.parks.forEach((park) => {
            if (park.checked) {
                selectedParks.push(park);
            }
        });

        if (selectedParks.length > 0) {
            parksError = '';
        }

        // Send selected parks array to formValues
        this.setState({
            formValues: {
                ...this.state.formValues,
                parks: selectedParks
            },
            formErrors: {
                ...this.state.formErrors,
                parks: parksError
            }
        });
    }

    prepareValuesForDB = (values) => {
        // Create return object
        let returnValues = {
            id: '',
            name: '',
            startDate: '',
            endDate: '',
            parks: [],
            photo: '',
            owner: '',
            createdDate: '',
        };

        // use existing journal id if exists, otherwise create new id
        returnValues.id = (values.id !== '') ? values.id : uuid.v4();

        returnValues.name = values.name;
        returnValues.startDate = new Date(values.startDate);
        returnValues.endDate = new Date(values.endDate);
        returnValues.parks = values.parks;
        returnValues.photo = values.photo;
        returnValues.owner = (values.owner !== '') ? values.owner : this.state.currentUser.id;
        returnValues.createdDate = values.createdDate ? values.createdDate : new Date();

        return returnValues;
    }

    // Check if form is ready for submit and return true/false
    readyForSubmit = (values) => {
        let ready = true;
        let nameError = (this.state.formErrors.name !== '') ? this.state.formErrors.name : '';
        let dateError = (this.state.formErrors.date !== '') ? this.state.formErrors.date : '';
        let parksError = (this.state.formErrors.parks !== '') ? this.state.formErrors.parks : '';

        // Check that required formValues have a value, if value missing update error message and return false
        if (values.name === '') {
            nameError = 'Please enter a journal name.';
            ready = false;
        }

        if (values.startDate === '') {
            dateError = 'Please enter a start and end date for journal.';
            ready = false;
        }

        if (values.endDate === '') {
            dateError = 'Please enter a start and end date for journal.';
            ready = false;
        }

        if (values.parks.length === 0) {
            parksError = 'Please select at least one park for journal.'
            ready = false;
        }

        if (nameError !== '' || dateError !== '' || parksError !== '') {
            ready = false;
        }

        this.setState({
            formErrors: {
                ...this.state.formErrors,
                name: nameError,
                date: dateError,
                parks: parksError
            }
        })

        return ready;
    }

    // Render Validation Error component
    renderError = (error) => {
        return (
            <FormValidationMessage>
                {error}
            </FormValidationMessage>            
        );
    }

    // handle name change
    handleNameChange = (value) => {
        let nameError = '';

        // Check input for errors, if found set error message
        if (!value) {
            nameError = 'Please enter a journal name.';
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                name: value
            },
            formErrors: {
                ...this.state.formErrors,
                name: nameError
            }
        });
    }

    // handle description change
    handleDescriptionChange = (value) => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                description: value
            }
        });
    }
    
    // handle start date change
    handleStartDateChange = (date) => {
        let dateError = '';

        // Check input for errors, if found set error message
        if (!date) {
            dateError = 'Please enter a start and end date.';
        }

        if (this.state.formValues.endDate !== '') {
            if (date > this.state.formValues.endDate) {
                dateError = 'Start date cant be after end date.';
            }
        }

        this.setState({
            formValues: {
                ...this.state.formValues,
                startDate: date
            },
            formErrors: {
                ...this.state.formErrors,
                date: dateError
            }
        })
    }

    // handle date change
    handleEndDateChange = (date) => {
        let dateError = '';

        // Check input for errors, if found set error message
        if (!date) {
            dateError = 'Please enter a start and end date.';
        }

        if (this.state.formValues.startDate !== '') {
            if (date < this.state.formValues.startDate) {
                dateError = 'End date cant be before start date.';
            }
        }

        this.setState({
            formValues: {
                ...this.state.formValues,
                endDate: date
            },
            formErrors: {
                ...this.state.formErrors,
                date: dateError
            }
        })
    }

    // render switch row item
    renderItem = ({ item, index }) => {
        return (
            <View style={styles.checkboxItems}>
                <Switch                
                    onValueChange={() => {
                        // create new parks object (tricks component into rerendering)
                        let newParks = [ ...this.state.parks ];
                        // flip checked for selected park
                        newParks[index] = { ...newParks[index], checked: !this.state.parks[index].checked };
                        // update parks object in state
                        this.setState({
                            ...this.state,
                            parks: newParks
                        });                  
                    }}
                    value={this.state.parks[index].checked}
                />
                <Text style={{ marginLeft: 5 }}>{item.name}</Text>
            </View>
        )
    };

    renderCameraButton = () => {
        return (
            <TouchableOpacity
                onPress={() => { this.setCameraModalVisible(true); }} >
                    <View style={styles.photo}>
                        <Icon style={{ fontSize: 80 }} name="ios-camera" /> 
                    </View>
            </TouchableOpacity>
        );
    }

    renderPhoto = (photo) => {
        return (
            <TouchableOpacity
                onLongPress={() => { this.onPhotoDeletePress(); }} >
                    <View style={styles.photo}>
                        <Image 
                                style={{ width: 300, height: 225 }}
                                source={{uri: `data:image/png;base64,${photo}`}} 
                            />
                    </View>
            </TouchableOpacity>
        );
    }

    render() {
        // Loading Mickey Graphic
        if (this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        // Check if errors exist in state.formErrors
        const nameError = (this.state.formErrors.name !== '') ? this.renderError(this.state.formErrors.name) : null;
        const dateError = (this.state.formErrors.date !== '') ? this.renderError(this.state.formErrors.date) : null;
        const parksError = (this.state.formErrors.parks !== '') ? this.renderError(this.state.formErrors.parks) : null;
    

        const photo = (this.state.formValues.photo === '') 
        ? this.renderCameraButton()
        : this.renderPhoto(this.state.formValues.photo)

        return (
            <View style={styles.container}>
                <View style={styles.form}>
                    {nameError}
                    <TextInput 
                        style={styles.input}
                        onChangeText={this.handleNameChange}
                        placeholder='Enter journal name'
                        value={this.state.formValues.name}
                    />
                    <View style={styles.photoSection}>
                        <TouchableOpacity
                            onPress={() => { this.setCameraModalVisible(true); }} >
                                <View style={styles.photo}>
                                    {photo}
                                </View>
                        </TouchableOpacity>
                    </View>
                    <TextInput 
                        style={styles.descriptionInput}
                        multiline={true}
                        numberOfLines={2}
                        maxLength={400}
                        onChangeText={this.handleDescriptionChange}
                        placeholder='Enter journal description'
                        value={this.state.formValues.description}
                    />
                    {dateError}
                    <View style={styles.datePickers}>
                        <DatePicker
                            style={styles.datepickerStart}
                            date={this.state.formValues.startDate}
                            mode="date"
                            placeholder="Select Start Date"
                            format="MM/DD/YYYY"
                            confirmBtnText="Ok"
                            cancelBtnText="Cancel"
                            onDateChange={this.handleStartDateChange}
                            showIcon={false}
                            customStyles={{
                                dateInput: {
                                    borderRadius: 5
                                },
                                btnTextConfirm: {
                                    color: '#387EF7'
                                }
                            }} 
                        />
                        <DatePicker
                            style={styles.datepickerEnd}
                            date={this.state.formValues.endDate}
                            mode="date"
                            placeholder="Select End Date"
                            format="MM/DD/YYYY"
                            confirmBtnText="Ok"
                            cancelBtnText="Cancel"
                            onDateChange={this.handleEndDateChange}
                            showIcon={false}
                            customStyles={{
                                dateInput: {
                                    borderRadius: 5
                                },
                                btnTextConfirm: {
                                    color: '#387EF7'
                                }
                            }} 
                        />
                    </View>
                    {parksError}
                    <FlatList
                        data={this.state.parks}
                        renderItem={this.renderItem}
                        keyExtractor={item => item.id} 
                    />
                </View>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.cameraModalVisible}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={() => { this.setCameraModalVisible(false); }} >
                                        <Text style={styles.modalCloseButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Take Photo</Text>
                            </View>
                            <View style={styles.cameraContainer}>
                                <RNCamera
                                    ref={ref => {
                                        this.camera = ref;
                                    }}
                                    style = {styles.cameraPreview}
                                    type={this.state.cameraConfig.type ? this.state.cameraConfig.type : RNCamera.Constants.Type.back}
                                />
                                <View style = {styles.cameraButtons}>
                                    <TouchableOpacity
                                        onPress={this.toggleCameraType.bind(this)}
                                    >
                                        <Icon style={{ fontSize: 60 }} name="ios-reverse-camera-outline" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={this.handlePhotoChange.bind(this)}
                                    >
                                        <Icon style={{ fontSize: 60 }} name="ios-camera-outline" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                </Modal>

            </View> 
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch'
    },
    form: {
        margin: 15
    },
    input: {
        padding: 10,
        borderWidth: .5,
        borderColor: '#aaa',
        borderRadius: 5,
        marginBottom: 15
    },
    modalContainer: {
        flex: 1
    },
    modalHeader: {
        backgroundColor: 'white',
        borderStyle: 'solid',
        borderBottomWidth: .5,
        borderBottomColor: 'lightgrey',
        paddingTop: 50,
        paddingBottom: 5
    },
    modalTitle: {
        paddingLeft: 15,
        paddingTop: 20,
        fontSize: 35,
        fontWeight: 'bold'
    },
    modalCloseButton: {
        paddingLeft: 25,
        paddingTop: 5
    },
    modalCloseButtonText: {
        fontSize: 16,
        color: 'blue'
    },
    photoSection: {
        backgroundColor: 'white',
        padding: 15,
        marginTop: 15,
        marginBottom: 15
    },
    photo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cameraContainer: {
        flex: 1,
        flexDirection: 'column'
    },
    cameraPreview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    cameraButtons: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        borderRadius: 5,
        margin: 20
    },
    descriptionInput: {
        padding: 5,
        borderWidth: .5,
        borderColor: '#aaa',
        borderRadius: 5,
        height: 75,
        marginBottom: 15
    },
    datePickers: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    checkboxItems: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    }
})

export default EditJournal;