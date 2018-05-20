import React, { Component } from "react";
import { 
    AlertIOS,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { 
    FormValidationMessage,
    Text
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import uuid from 'react-native-uuid';

import * as UserService from '../../realm/userService';
import ListItem from '../../components/ListItem';
import LoadingMickey from '../../components/LoadingMickey';

class Attraction extends Component {
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
            parks: UserService.parkRealm.objects('Park'),
            selectedPark: {
                parkId: '',
                parkName: '',
            },
            formValues: {
                id: '',
                name: '',
                photo: '',
                parkId: '',
                description: '',
                heightToRide: '',
                hasScore: false,
                dateCreated: '',
                dateModified: '',
                dateSynced: '',
            },
            formErrors: {
                name: '',
                parkId: '',
                description: '',
            },
            parkModalVisible: false,
            attractionLoaded: false,
            isLoading: true,
            isEdit: false
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation events
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.updateCurrentUserInState(UserService.currentUser);
            // check if an attraction id was passed, if so update state with attraction data
            if (this.props.attractionId) {
                const attraction = UserService.parkRealm.objectForPrimaryKey('Attraction', this.props.attractionId);

                this.loadAttractionIntoState(attraction);
            
            } else if (!this.state.attractionLoaded) {
                // New journal - Set park if passed
                if (this.props.parkId) {
                    const park = UserService.parkRealm.objectForPrimaryKey('Park', this.props.parkId);
                
                    if (park) {
                        //disable loading animation and set selected park
                        this.setState({
                            ...this.state,
                            selectedPark: {
                                parkId: park.id,
                                parkName: park.name,
                            },
                            formValues: {
                                ...this.state.formValues,
                                parkId: park.id
                            },
                            isLoading: false
                        });
                    } else {
                        //  park missing, disable loading
                        this.setState({
                            ...this.state,
                            isLoading: false
                        });
                    }                
                }                
            }
        }
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'done') {
                this.handleDone();
            }
        }
    }

    // Navbar styling
    componentDidMount() {
        this.props.navigator.setStyle({
            navBarNoBorder: false
        })
    }

    // loads journal data into state and flags isEdit true
    loadAttractionIntoState= (attraction) => {
        if (attraction) {
            this.setState({
                ...this.state,
                selectedPark: {
                    parkId: attraction.park.id,
                    parkName: attraction.park.name,
                },
                formValues: {
                    id: attraction.id,
                    name: attraction.name,
                    parkId: attraction.park.id,
                    photo: attraction.photo,
                    description: attraction.description,
                    heightToRide: attraction.heightToRide.toString(),
                    hasScore: attraction.hasScore ? true : false,  
                    dateCreated: attraction.dateCreated,
                    dateModified: attraction.dateModified,
                    dateSynced: attraction.dateSynced
                },
                attractionLoaded: true,
                isLoading: false,
                isEdit: true
            });
        }
    }

    // loads current user object into state if exists
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

    // set park modal visible
    setParkModalVisible(visible) {
        this.setState({
            ...this.state,
            parkModalVisible: visible
        });
    }

    // photo delete press event
    onPhotoDeletePress = () => {
        // display confirm prompt, user must type CONFIRM to delete photo
        AlertIOS.alert(
            'Confirm Delete',
            'Are you sure you want to delete the attraction image?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    onPress: () => this.handleDeletePhoto()
                }
            ]
        );
    }

    // handle photo delete
    handleDeletePhoto = () => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                photo: ''
            }
        });
    }

    // handle Attraction save event
    // TODO: Go back to Attraction List after edit - For now pops to root screen
    handleDone = () => {
        // Check if ready to submit
        const ready = this.readyForSubmit(this.state.formValues);

        if(ready) {
            // start loading animation
            this.setState({
                ...this.state,
                isLoading: true
            });

            // Prep values for realm save
            const submitValues = this.prepareValuesForDB(this.state.formValues);

            // save attraction
            UserService.adminSaveAttraction(submitValues)
                .then((attraction) => {
                    // Success - stop animation
                    this.setState({
                        ...this.state,
                        isLoading: false
                    });
                    console.log('save successful');
                    this.props.navigator.popToRoot();
                }).catch((error) => {
                    console.log('error: ');
                    console.log(error);
                    // Failed - stop animation
                    this.setState({
                        ...this.state,
                        isLoading: false
                    });
                });
        } else {
            AlertIOS.alert('Please correct form errors and try again.');
        }        
    }

    // prep return values for realm
    prepareValuesForDB = (values) => {
        // Create return object
        let returnValues = {
            id: '',
            name: '',
            photo: '',
            parkId: '',
            description: '',
            heightToRide: '',
            hasScore: false,
            dateCreated: '',
            dateModified: '',
            dateSynced: ''
        };

        // use existing journal id if exists, otherwise create new id
        returnValues.id = (values.id !== '') ? values.id : uuid.v4();

        returnValues.name = values.name;
        returnValues.parkId = values.parkId;
        returnValues.photo = values.photo;
        returnValues.description = values.description;
        returnValues.heightToRide = (values.heightToRide !== '') ? parseInt(values.heightToRide, 10) : 0;
        returnValues.hasScore = values.hasScore ? true : false;
        returnValues.dateCreated = (values.dateCreated !== '') ? values.dateCreated : new Date();
        returnValues.dateModified = (values.dateModified !== '') ? values.dateModified : new Date();
        returnValues.dateSynced = (values.dateSynced !== '') ? values.dateSynced : new Date();

        return returnValues;
    }

    // Check if form is ready for submit and return true/false
    readyForSubmit = (values) => {
        let ready = true;
        let nameError = (this.state.formErrors.name !== '') ? this.state.formErrors.name : '';
        
        // Check that required formValues have a value, if value missing update error message and return false
        if (values.name === '') {
            nameError = 'Name';
            ready = false;
        }

        // check for an error messages and return false if found
        if (nameError !== '') {
            ready = false;
        }

        // update form errors in state
        this.setState({
            formErrors: {
                ...this.state.formErrors,
                name: nameError
            }
        });

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
            nameError = 'Name';
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

    // handle name change
    handleHeightToRideChange = (value) => {
        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                heightToRide: value.replace(/[^0-9]/g, '')
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

    // handle park change
    handleParkChange = (parkId, parkName) => {
        this.setState({
            selectedPark: {
                parkId: parkId,
                parkName: parkName
            },
            formValues: {
                ...this.state.formValues,
                parkId: parkId
            },
            formErrors: {
                ...this.state.formErrors,
                parkId: ''
            },
            parkModalVisible: false
        });
    }

    // handle fastpass change
    handleHasScoreChange = () => {
        this.setState({
            formValues: {
                ...this.state.formValues,
                hasScore: !this.state.formValues.hasScore
            }
        });
    }


    

    // render photo image
    renderPhoto = (photo) => {
        return (
            <TouchableOpacity
                onLongPress={() => { this.onPhotoDeletePress(); }} >
                    <View style={styles.photo}>
                        <Image 
                            style={{ width: 300, height: 300 }}
                            resizeMode={'cover'}
                            source={{uri: `data:image/png;base64,${photo}`}} />
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

        // render photo or camera button
        const photo = (this.state.formValues.photo !== '') 
        ? this.renderPhoto(this.state.formValues.photo) 
        : null

        return (
            <KeyboardAwareScrollView style={styles.container}>
                <View style={styles.form}>
                    <TouchableOpacity
                        onPress={() => { this.setParkModalVisible(true); }} >
                            <View
                                style={[
                                    styles.parkAttractionTitle, 
                                    { borderBottomWidth: .5, borderBottomColor: '#444444' },
                                    (this.state.formErrors.parkId !== '') ? styles.error : null
                                    ]}>
                                <Text style={styles.parkAttractionText}>
                                    { this.state.selectedPark.parkName !== '' ? this.state.selectedPark.parkName : 'Select a Park'}
                                </Text>
                                <Icon style={styles.parkAttractionArrow} color='lightgrey' name="ios-arrow-forward" />
                            </View>
                    </TouchableOpacity>
                    
                    <TextInput 
                        style={[
                            styles.input,
                            (this.state.formErrors.name !== '') ? styles.error : null
                        ]}
                        onChangeText={this.handleNameChange}
                        placeholder='Enter attraction name'
                        value={this.state.formValues.name}
                        placeholderTextColor={'#444444'}
                    />
                    <View style={styles.photoSection}>
                        {photo}
                    </View>
                    <TextInput 
                        style={styles.input}
                        onChangeText={this.handleHeightToRideChange}
                        placeholder='Enter height to ride'
                        value={this.state.formValues.heightToRide + "\""}
                        placeholderTextColor={'#444444'}
                    />
                    <View style={styles.hasscore}>
                        <Text style={{ marginRight: 5, color: '#FFFFFF' }}>Has Score</Text>
                        <Switch
                            onValueChange={this.handleHasScoreChange}
                            value={this.state.formValues.hasScore}
                            onTintColor={'#387EF7'}
                            tintColor={'#e9e9e9'}
                        />
                    </View>
                    <TextInput 
                        style={styles.descriptionInput}
                        multiline={true}
                        numberOfLines={2}
                        maxLength={400}
                        onChangeText={this.handleDescriptionChange}
                        placeholder='Enter attraction description'
                        value={this.state.formValues.description}
                        placeholderTextColor={'#444444'}
                    />
                </View>


                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.parkModalVisible}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => { this.setParkModalVisible(false); }}
                            >
                                <Text style={styles.modalCloseButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Select A Park</Text>
                        </View>
                        <View style={styles.modalBody}>
                            <FlatList
                                data={this.state.parks}
                                renderItem={({ item }) =>     
                                    <ListItem
                                        id={item.id.toString()}
                                        title={item.name}
                                        onPress={this.handleParkChange}
                                        viewStyle={styles.listView}
                                        textStyle={styles.listText} 
                                    />
                                }
                                keyExtractor={item => item.id.toString()}
                            />
                        </View>
                    </View>
                </Modal>
            </KeyboardAwareScrollView> 
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    form: {
        margin: 15
    },
    input: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#AAAAAA'
    },
    
    photoSection: {
        padding: 15
    },
    photo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    descriptionInput: {
        backgroundColor: '#AAAAAA',
        padding: 5,
        borderRadius: 5,
        height: 75,
        marginBottom: 15
    },
    error: {
        borderWidth: 1,
        borderColor: 'red'
    },
    parkAttractionSection: {
        flexDirection: 'column',
        backgroundColor: '#252525',
        marginTop: 30,
        marginBottom: 15
    },
    parkAttractionTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 15,
        paddingLeft: 15
    },
    parkAttractionText: {
        color: '#FFFFFF',
        fontSize: 20,
        paddingRight: 10
    },
    parkAttractionArrow: {
        fontSize: 24
    },
    modalContainer: {
        flex: 1
    },
    modalHeader: {
        backgroundColor: '#252525',
        borderStyle: 'solid',
        paddingTop: 50,
        paddingBottom: 5
    },
    modalTitle: {
        paddingLeft: 15,
        paddingTop: 20,
        fontSize: 35,
        fontWeight: 'bold',
        color: '#FFFFFF'
    },
    modalCloseButton: {
        paddingLeft: 25,
        paddingTop: 5
    },
    modalCloseButtonText: {
        fontSize: 16,
        color: '#FFFFFF'
    },
    modalBody: {
        flex: 1,
        backgroundColor: '#151515',
        paddingBottom: 50
    },
    listView: {
        padding: 5,
        paddingRight: 10,
        paddingLeft: 10,
        borderBottomColor: '#444444',
        borderBottomWidth: 1,
        backgroundColor: '#151515',
    },
    listText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 20
    },
    fastpass: {
        flexDirection: 'row',
        alignItems: 'center'
    },
})

export default Attraction;