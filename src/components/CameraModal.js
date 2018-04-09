import React, { Component } from "react";
import PropTypes from 'prop-types';
import { 
    View, 
    Text, 
    Modal,
    TouchableOpacity,
    StyleSheet 
} from "react-native";
import { RNCamera } from 'react-native-camera';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

class CameraModal extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            cameraConfig: {
                type: RNCamera.Constants.Type.back,
                flashMode: RNCamera.Constants.FlashMode.off
            },
            isVisible: false,
            displayCameraRoll: false
        };
    }

    // toggle camera roll modal
    toggleCameraRoll = () => {
        this.setState({
            ...this.state,
            displayCameraRoll: !this.state.displayCameraRoll
        });
    }

    // toggle front/back camera
    toggleCameraType = () => {
        this.setState({
            ...this.state,
            cameraConfig: {
                ...this.state.cameraConfig,
                type: (this.state.cameraConfig.type === RNCamera.Constants.Type.back) ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back
            }
        });
    }

    // set flash mode
    setFlashMode = (flashMode) => {
            // set flash mode in state
            this.setState({
                ...this.state,
                cameraConfig: {
                    ...this.state.cameraConfig,
                    flashMode: flashMode
                }
            });
        //}
    }

    // save photo
    savePhoto = async function() {
        if (this.camera) {
            // photo options - TODO: research better quality storage size and if its worth it
            const options = { 
                quality: this.props.quality ? this.props.quality : .5,
                base64: true 
            };
            this.camera.takePictureAsync(options).then((data) => {
                // success - pass base64 of photo back
                this.props.savePhoto(data.base64);
            }).catch((error) => {
                // failed - TODO: Better error handling or remove..
                console.log('something failed saving photo');
            })
        }
    }

    renderCamera = () => {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={this.props.toggleCameraModal} 
                        >
                            <Text style={styles.closeButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <View style={styles.flashButtons}>
                            <TouchableOpacity
                                onPress={() => this.setFlashMode(RNCamera.Constants.FlashMode.torch)} 
                            >
                                <MaterialCommunityIcon 
                                    name='flashlight'
                                    style={[
                                        (this.state.cameraConfig.flashMode === RNCamera.Constants.FlashMode.torch) ? styles.flashButtonSelected : styles.flashButton,
                                        { marginRight: 25 }
                                    ]} 
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => this.setFlashMode(RNCamera.Constants.FlashMode.auto)} 
                            >
                                <MaterialIcon 
                                    name='flash-auto'
                                    style={(this.state.cameraConfig.flashMode === RNCamera.Constants.FlashMode.auto) ? styles.flashButtonSelected : styles.flashButton}
                                />
                            </TouchableOpacity>    
                            <TouchableOpacity
                                onPress={() => this.setFlashMode(RNCamera.Constants.FlashMode.on)} 
                            >
                                <MaterialIcon 
                                    name='flash-on'
                                    style={(this.state.cameraConfig.flashMode === RNCamera.Constants.FlashMode.on) ? styles.flashButtonSelected : styles.flashButton}   
                                />
                            </TouchableOpacity>    
                            <TouchableOpacity
                                onPress={() => this.setFlashMode(RNCamera.Constants.FlashMode.off)} 
                            >
                                <MaterialIcon 
                                    name='flash-off'
                                    style={(this.state.cameraConfig.flashMode === RNCamera.Constants.FlashMode.off) ? styles.flashButtonSelected : styles.flashButton}
                                />
                            </TouchableOpacity>    
                        </View>
                    </View>
                </View>
                <View style={styles.cameraContainer}>
                    <RNCamera
                        ref={ref => { this.camera = ref; }}
                        style={styles.cameraPreview}
                        type={this.state.cameraConfig.type}
                        flashMode={this.state.cameraConfig.flashMode}
                    />
                    <View style = {styles.cameraButtons}>
                        <TouchableOpacity
                            onPress={this.toggleCameraRoll}
                        >
                            <IonIcon style={styles.cameraRollButton} name="ios-photos-outline" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.savePhoto.bind(this)}
                        >
                            <MaterialCommunityIcon style={styles.saveButtonInnerCircle} name="circle" />
                            <MaterialCommunityIcon style={styles.saveButtonOuterCirle} name="circle-outline" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.toggleCameraType}
                        >
                            <IonIcon style={styles.typeButton} name="ios-reverse-camera-outline" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    renderCameraRoll = () => {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={this.toggleCameraRoll} 
                        >
                            <Text style={styles.closeButtonText}>Camera</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Text>Camera Roll will display here</Text>
            </View>
        )
    }

    // render the camera modal
    render() {
        const displayCameraRoll = this.state.displayCameraRoll ? true : false;

        let modalContent;
        if (displayCameraRoll) {
            modalContent = this.renderCameraRoll();
        } else {
            modalContent = this.renderCamera();
        }

        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible={this.props.visible}
            >
                {modalContent}
            </Modal>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#252525',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 50
    },
    headerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    closeButton: {
        paddingLeft: 25,
        paddingTop: 5
    },
    closeButtonText: {
        fontSize: 16,
        color: '#FFFFFF'
    },
    flashButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 10
    },
    flashButton: {
        fontSize: 30,
        color: '#888888',
        marginRight: 10,
        marginLeft: 10
    },
    flashButtonSelected: {
        fontSize: 30,
        color: '#FFFFFF',
        marginRight: 10,
        marginLeft: 10
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
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 30
    },
    cameraRollButton: {
        fontSize: 40,
        color: '#FFFFFF'
    },
    saveButtonInnerCircle: {
        fontSize: 60,
        color: '#FFFFFF'
    },
    saveButtonOuterCirle: {
        fontSize: 80,
        color: '#FFFFFF',
        marginTop: -75.5,
        marginLeft: -10
    },
    typeButton: {
        fontSize: 40,
        color: '#FFFFFF'
    }
});

CameraModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    savePhoto: PropTypes.func.isRequired,
    toggleCameraModal: PropTypes.func.isRequired,
    quality: PropTypes.string
};

export default CameraModal;