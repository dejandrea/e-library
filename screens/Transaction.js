import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native'
import * as Permissions from "expo-permissions"
import { BarCodeScanner } from 'expo-barcode-scanner'


import styles from './styles'

export default class TransactionScreen extends Component {
    constructor(props){
        super(props)
        this.state = {
            domState:"normal",
            s:null,
            scanned:false,
            scannedData:""
        }
    }
    getCamPermissions = async domState => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA)

        this.setState({
            hasCamPermissions: status === "granted",
            domState:domState,
            scanned:false
        })
    }
    handleBarCodeScanned = async ({type,data})=>{
        this.setState({
            scannedData:data,
            domState:'normal',
            scanned:true
        })
    }
    render() {
        const {domState,hasCamPermissions,scannedData,scanned} = this.state;
        if (domState === 'scanner') {
            return(
                <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject} />
            )
        }
        return (
            <View style={styles.container}>
                <Text style={styles.text}>{hasCamPermissions ? scannedData : "solicitar Permissão para a Camera"}</Text>
                <TouchableOpacity style={styles.button}
                onPress={()=>this.getCamPermissions('scanner')}>
                    <Text style={styles.buttonText}>Digitalizador QRCode</Text>
                </TouchableOpacity>
            </View>
        )
    }

}