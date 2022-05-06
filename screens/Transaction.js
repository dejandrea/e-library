import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  ToastAndroid,
  Alert
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import db from "../config"
import firebase from "firebase";

//carregando as imagens da tela
const bgImage = require("../assets/background2.png");
const appIcon = require("../assets/appIcon.png");
const appName = require("../assets/appName.png");

export default class TransactionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookId: "",
      studentId: "",
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false,
      bookName: "",
      studentName: ""
    };
  }

  getCameraPermissions = async domState => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" é verdadeiro se o usuário concedeu permissão
          status === "granted" é falso se o usuário não concedeu permissão
        */
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    const { domState } = this.state;

    if (domState === "bookId") {
      this.setState({
        bookId: data,
        domState: "normal",
        scanned: true
      });
    } else if (domState === "studentId") {
      this.setState({
        studentId: data,
        domState: "normal",
        scanned: true
      });
    }
  };

  //criando uma função para gerenciar a transação
  handleTransaction = async () => {
    var { bookId, studentId } = this.state;
    await this.getBookDetails(bookId)
    await this.getStudentDetails(studentId)


    var transactionType = await this.checkBookAvailability(bookId)

    if (!transactionType) {
      this.setState({
        bookId: "",
        studentId: ""
      })
      ToastAndroid.show("O livro não existe em nosso banco de dados", ToastAndroid.SHORT)
      //Alert.alert("O livro não existe em nosso banco de dados")
    } else if (transactionType === "issue") {
      var isElegible = await this.checkStudentElegibilityForBookIssue(studentId)

      if (isElegible) {
        var { bookName, studentName } = this.state
        this.initiateBookIssue(bookId, studentId, bookName, studentName);

        ToastAndroid.show("Livro entregue ao aluno!", ToastAndroid.SHORT)
        //Alert.alert("Livro entregue ao aluno!")
      }

    } else {
      var isElegible = await this.checkStudentElegibilityForBookReturn(bookId,studentId)

      if (isElegible) {
        var { bookName, studentName } = this.state
        this.initiateBookReturn(bookId, studentId, bookName, studentName);
        ToastAndroid.show("Livro retornado à biblioteca!", ToastAndroid.SHORT)
        // Alert.alert("Livro retornado à biblioteca!")
      }
    }
    // db.collection("books")
    //   .doc(bookId)
    //   .get()
    //   .then(doc => {
    //     console.log(doc.data())
    //     var book = doc.data();
    //     if (book.is_book_available) {
    //       var {bookName, studentName } = this.state
    //       this.initiateBookIssue(bookId, studentId, bookName, studentName);

    //       //ToastAndroid.show("Livro entregue ao aluno!",ToastAndroid.SHORT)
    //       Alert.alert("Livro entregue ao aluno!")
    //     } else {
    //       var {bookName, studentName } = this.state
    //       this.initiateBookReturn(bookId, studentId, bookName, studentName);
    //       //ToastAndroid.show("Livro retornado à biblioteca!",ToastAndroid.SHORT)
    //       Alert.alert("Livro retornado à biblioteca!")
    //     }
    //   });
  }

  //coleta os detalhes do livro
  getBookDetails = bookId => {
    bookId = bookId.trim();
    db.collection("books")
      .where("book_id", "==", bookId)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            bookName: doc.data().book_name
          });
        });
      });
  };

  //coleta os detalhes do estudante
  getStudentDetails = studentId => {
    studentId = studentId.trim();
    db.collection("students")
      .where("student_id", "==", studentId)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            studentName: doc.data().student_name
          });
        });
      });
  };

  //cria uma transação de entrega
  initiateBookIssue = async (bookId, studentId, bookName, studentName) => {
    //adicionar uma transação no banco
    db.collection('transactions').add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "issue"
    })
    //alterar o status de um livro para indisponível
    db.collection("books")
      .doc(bookId)
      .update({
        is_book_available: false
      })

    //alterar o número de livros retirados pelo aluno
    db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(1)
      })

    //zerando os estados locais
    this.setState({
      bookId: "",
      studentId: ""
    })
  };

  //cria uma transação de retorno
  initiateBookReturn = async (bookId, studentId, bookName, studentName) => {
    //adicionar uma transação de retorno
    db.collection("transactions").add({
      student_id: studentId,
      student_name: studentName,
      book_id: bookId,
      book_name: bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "return"
    })
    //alterar status do livro para disponível
    db.collection("books")
      .doc(bookId)
      .update({
        is_book_available: true
      })
    //alterar número de livros retirados pelo aluno
    db.collection("students")
      .doc(studentId)
      .update({
        number_of_books_issued: firebase.firestore.FieldValue.increment(-1)
      })
    //Atualizando estado local
    this.setState({
      bookId: "",
      studentId: ""
    })
  };

  //verifica a disponibilidade do livro
  checkBookAvailability = async bookId => {
    //coletamos os dados
    const bookRef = await db
      .collection("books")
      .where("book_id", "==", bookId)
      .get()

      //verificamos se o livro existe
    var transactionType = ""
    if (bookRef.docs.length == 0) { //se não existir o livro, retornamos falso
      transactionType = false
    } else {
      //se existir, retornamos a disponibilidade atual do livro
      bookRef.docs.map(doc => {
        //se o livro estiver disponível, o tipo da transação será issue
        //se não estiver disponível, será return
        transactionType = doc.data().is_book_available ? "issue" : "return"
      })
    }
    return transactionType
  }

  //verifica e elegibilidade do aluno para retirar um livro
  checkStudentElegibilityForBookIssue = async studentId => {
    const studentRef = await db
      .collection("students")
      .where("student_id","==",studentId)
      .get()

      //verificamos se o estudante existe
      //se não informamos que o aluno não existe e zeramos os states
    var isStudentElegible = ""
    if (studentRef.docs.length == 0) {
      this.setState({
        bookId: "",
        studentId:""
      })
      isStudentElegible = false
      Alert.alert("O ID do aluno não existe em nosso banco de dados!")
    } else {
      //se o estudante existir verificamos se ele pegou menos de dois livros
      studentRef.docs.map(doc =>{
        if (doc.data().number_of_books_issued < 2) {  //se sim retornamos true para a elegibilidade do aluno
          isStudentElegible = true
        } else {
          isStudentElegible = false //se não retornamos falso, informamos ao usuário que o aluno esta com 2 livros alugados e zeramos os states
          Alert.alert("O aluno já retirou 2 livros!")
          this.setState({
            bookId:"",
            studentId:""
          })
        }
      })
    }
    return isStudentElegible
  }

  //verifica e elegibilidade do aluno para devolver um livro
  checkStudentElegibilityForBookReturn = async (bookId, studentId) => {
    //coletando as informações no banco de dados
    const transactionRef = await db
      .collection("transactions")
      .where("book_id","==",bookId)
      .limit(1)
      .get()
  
    var isStudentElegible = ""
    transactionRef.docs.map(doc => {
      var lastBookTransaction = doc.data() //mapeamos os dados da ultima transação realizada com o livro em questão
      if (lastBookTransaction.student_id === studentId) {  //verificamos se o livro foi retirado por esse estudante
        isStudentElegible = true; //se sim, retornamos true
      } else {
        isStudentElegible = false //se não, retornamos false e informamos que o livro não foi retirado por esse estudante.
        Alert.alert("O livro não foi retirado por esse aluno!")
        this.setState({ //zeramos os states
          bookId:"",
          studentId:""
        })
      }
      
    })
    return isStudentElegible
  }

  render() {
    const { bookId, studentId, domState, scanned } = this.state; //extraindo informações do state para as variáveis
    if (domState !== "normal") {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ImageBackground source={bgImage} style={styles.bgImage}>
          <View style={styles.upperContainer}>
            <Image source={appIcon} style={styles.appIcon} />
            <Image source={appName} style={styles.appName} />
          </View>
          <View style={styles.lowerContainer}>
            <View style={styles.textinputContainer}>
              {/* Campo para o ID do livro */}
              <TextInput
                style={styles.textinput}
                placeholder={"ID do Livro"}
                placeholderTextColor={"#FFFFFF"}
                value={bookId}
                onChangeText={text => this.setState({ bookId: text })}
              />
              {/* Botão para scanear o livro */}
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("bookId")}
              >
                <Text style={styles.scanbuttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.textinputContainer, { marginTop: 25 }]}>
              {/* Campo para o ID do estudante */}
              <TextInput
                style={styles.textinput}
                placeholder={"ID do Estudante"}
                placeholderTextColor={"#FFFFFF"}
                value={studentId}
                onChangeText={text => this.setState({ studentId: text })}
              />
              {/* Botão para scanear o ID do estudante */}
              <TouchableOpacity
                style={styles.scanbutton}
                onPress={() => this.getCameraPermissions("studentId")}
              >
                <Text style={styles.scanbuttonText}>Digitalizar</Text>
              </TouchableOpacity>
            </View>
            {/* Botão enviar */}
            <TouchableOpacity style={[styles.button, { marginTop: 25 }]}
              onPress={this.handleTransaction}
            >
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
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
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80
  },
  appName: {
    width: 180,
    resizeMode: "contain"
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#9DFD24",
    borderColor: "#FFFFFF"
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF"
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#9DFD24",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  scanbuttonText: {
    fontSize: 20,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold"
  },
  button: {
    width: "43%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f48d20",
    borderRadius: 15,

  },
  buttonText: {
    fontSize: 24,
    color: "#ffffff",
    fontFamily: "Rajdhani_600SemiBold"
  }
});