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
import Icon from 'react-native-vector-icons/Ionicons';

class CameraModal extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            cameraConfig: {
                type: RNCamera.Constants.Type.back
            },
            isVisible: false
        }
    }

    // toggle front/back camera
    toggleCameraType = () => {
        this.setState({
            ...this.state,
            cameraConfig: {
                type: (this.state.cameraConfig.type === RNCamera.Constants.Type.back) ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back
            }
        });
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

    // render the camera modal
    render() {
        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible={this.props.visible}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={this.props.toggleCameraModal} 
                        >
                            <Text style={styles.modalCloseButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Attach Photo</Text>
                    </View>
                    <View style={styles.cameraContainer}>
                        <RNCamera
                            ref={ref => { this.camera = ref; }}
                            style={styles.cameraPreview}
                            type={this.props.type ? this.props.type : this.state.cameraConfig.type}
                        />
                        <View style = {styles.cameraButtons}>
                            <TouchableOpacity
                                onPress={this.toggleCameraType}
                            >
                                <Icon style={{ fontSize: 60 }} name="ios-reverse-camera-outline" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={this.savePhoto.bind(this)}
                            >
                                <Icon style={{ fontSize: 60 }} name="ios-camera-outline" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}

var styles = StyleSheet.create({
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
});

CameraModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    savePhoto: PropTypes.func.isRequired,
    toggleCameraModal: PropTypes.func.isRequired,
    quality: PropTypes.string,
    type: PropTypes.any
};

export default CameraModal;