import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import globalStyles from '../../styles/GlobalStyles';
import { auth, db } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        
        // Verifica se o usuário tem uma casa associada
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.houseId) {
            // Verifica se a casa existe
            const houseDocRef = doc(db, 'houses', userData.houseId);
            const houseDoc = await getDoc(houseDocRef);
            
            if (houseDoc.exists()) {
              // Redireciona para o Dashboard
              navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
              });
            } else {
              // Se casa não existe mais vai redirecionar para seleção de casa
              navigation.reset({
                index: 0,
                routes: [{ name: 'HouseSelection' }],
              });
            }
          } else {
            // Se suário não tem casa associada vai redirecionar para seleção de casa
            navigation.reset({
              index: 0,
              routes: [{ name: 'HouseSelection' }],
            });
          }
        } else {
          // Documento do usuário não existe vai redirecionar para seleção de casa
          navigation.reset({
            index: 0,
            routes: [{ name: 'HouseSelection' }],
          });
        }
      })
      .catch((error) => {
        let message = 'Erro ao fazer login.';
        if (error.code === 'auth/user-not-found') {
          message = 'Usuário não encontrado.';
        } else if (error.code === 'auth/wrong-password') {
          message = 'Senha incorreta.';
        } else if (error.code === 'auth/invalid-email') {
          message = 'Email inválido.';
        }
        Alert.alert('Erro', message);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={globalStyles.heading}>Seja bem vindo ao Ca$alApp!</Text>

        <View style={styles.inputGroup}>
          <TextInput
            placeholder="Email Address"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={[globalStyles.textInput, { width: '100%' }]}
          />

          <View style={[globalStyles.textInput, globalStyles.passwordInput]}>
            <TextInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={{ flex: 1, fontSize: 16 }}
            />
          </View>

          <TouchableOpacity>
            <Text style={{ color: '#006ffd', fontWeight: '600', fontSize: 14 }}>Esqueceu sua senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={globalStyles.primaryButton} onPress={handleLogin}>
            <Text style={globalStyles.primaryButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={{ fontSize: 12, color: '#71727a' }}>Não tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={{ fontSize: 12, color: '#006ffd', fontWeight: '600' }}> Registre-se agora.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
  },
  inputGroup: {
    gap: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default Login;