import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  KeyboardAvoidingView
} from "react-native";
import firebase from "firebase";

const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      senha: ""
    }
  }

  handleLogin = (email, senha) => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, senha)
      .then(() => {
        this.props.navigation.navigate("BottomTab")
      })
      .catch(error => {
        Alert.alert(error.message)
      })
  }

  render() {
    const { email, senha } = this.state
    return (
      <KeyboardAvoidingView behavior='padding' style={styles.container}>
        <ImageBackground source={bgImage} style={styles.bgImage} >
          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>
            {/* Campo de email */}
            <TextInput 
              style={styles.textinput}
              onChangeText={text => this.setState({ email: text })}
              placeholder={"Insira seu Email"}
              placeholderTextColor={"#FFFFFF"}
              autoFocus
            />
            {/* Campo de senha */}
            <TextInput
               style={[styles.textinput, { marginTop: 20 }]}
               onChangeText={text => this.setState({ senha: text })}
               placeholder={"Insira sua Senha"}
               placeholderTextColor={"#FFFFFF"}
               secureTextEntry
            />
            {/* Botão enviar */}
            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={() => this.handleLogin(email, senha)}
            >
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },

  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  appIcon: {
    width: 280,
    height: 280,
    resizeMode: "contain",
    marginTop: 80
  },
  appName: {
    width: 180,
    resizeMode: "contain",
    marginBottom: 30
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  textinput: {
    width: "75%",
    height: 55,
    padding: 10,
    borderColor: "#FFFFFF",
    borderWidth: 4,
    borderRadius: 10,
    fontSize: 18,
    color: "#FFFFFF",
    fontFamily: "Rajdhani_600SemiBold",
    backgroundColor: "#5653D4"
  },
  button: {
    width: "43%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F48D20",
    borderRadius: 15
  },
  buttonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontFamily: "Rajdhani_600SemiBold"
  }
});