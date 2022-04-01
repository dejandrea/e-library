import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default class SearchScreen extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Tela de Pesquisa</Text>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#5653d4',
    },
    text:{
        color:'#ffff',
        fontSize:30,
    }
})