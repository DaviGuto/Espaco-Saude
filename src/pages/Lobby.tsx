import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/pt-br';
import * as ImagePicker from 'expo-image-picker';
import { storage, firestore } from '../firebaseConfig'; // Certifique-se de importar o Firestore
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs } from 'firebase/firestore';

interface Post {
  uri: string;
  title: string;
  caption: string;
  date: string;
}

export function Lobby() {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const flatListRef = useRef<FlatList>(null);
  const Tab = createBottomTabNavigator();

  moment.locale('pt-br');

  const generateDays = () => {
    let days = [];
    for (let i = -15; i <= 15; i++) {
      const day = moment().add(i, 'days');
      days.push({
        dateString: day.format('YYYY-MM-DD'),
        dayNumber: day.format('D'),
        dayName: day.format('ddd'),
      });
    }
    return days;
  };

  const days = generateDays();
  const todayIndex = days.findIndex(day => day.dateString === moment().format('YYYY-MM-DD'));

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: todayIndex, animated: true });
    }
  }, [todayIndex]);

  function Home() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');

    // Função para carregar posts do Firestore
    const loadPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'posts'));
        const postsData: Post[] = [];
        querySnapshot.forEach((doc) => {
          postsData.push({
            uri: doc.data().uri,
            title: doc.data().title,
            caption: doc.data().caption,
            date: doc.data().date,
          });
        });
        // Ordenar postagens pela data
        postsData.sort((a, b) => (a.date < b.date ? 1 : -1)); // Último primeiro
        setPosts(postsData);
      } catch (error) {
        console.error('Erro ao carregar posts', error);
      }
    };

    const handleImagePick = async () => {
      console.log("Botão de Adicionar foi clicado!");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    };

    const uploadImage = async () => {
      if (!imageUri) return;

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const imageRef = ref(storage, `images/${Date.now()}`);
      await uploadBytes(imageRef, blob);
      const url = await getDownloadURL(imageRef);

      // Adiciona o post ao Firestore
      try {
        const newPost = {
          uri: url,
          title: title,
          caption: caption,
          date: moment().format('YYYY-MM-DD HH:mm:ss'), // Adiciona a data atual
        };
        await addDoc(collection(firestore, 'posts'), newPost);
        setPosts((prevPosts) => [newPost, ...prevPosts]); // Adiciona novo post ao início
        setImageUri(null); // Limpa a imagem depois do upload
        setTitle(''); // Limpa o título
        setCaption(''); // Limpa a legenda
      } catch (error) {
        console.error('Erro ao adicionar post ao Firestore', error);
      }
    };

    useEffect(() => {
      loadPosts(); // Carrega os posts quando o componente é montado
    }, []);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bem-vindo, Usuário.</Text>
        <Text style={[styles.title, { marginTop: 20 }, {color: '#CECECE'}]}>Novidades:</Text>

        {/* Se uma imagem for selecionada, mostra a imagem e os campos para título e legenda */}
        {imageUri ? (
          <>
            {/* Preview da imagem */}
            <Image source={{ uri: imageUri }} style={styles.previewImage} />

            {/* Campos para Título e Legenda */}
            <TextInput
              style={styles.input}
              placeholder="Título"
              placeholderTextColor="#CECECE"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Legenda"
              placeholderTextColor="#CECECE"
              value={caption}
              onChangeText={setCaption}
            />

            {/* Botão para fazer upload da imagem */}
            <TouchableOpacity onPress={uploadImage} style={[styles.button, { zIndex: 11 }, { justifyContent: 'center' }]}>
              <Ionicons name="cloud-upload-outline" size={24} color="#101215" />
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Caso não haja imagem, mostra o botão "Adicionar"
          <TouchableOpacity style={styles.button} onPress={handleImagePick}>
            <Ionicons name="add-circle-outline" size={24} color="#101215" />
            <Text style={styles.buttonText}>Adicionar</Text>
          </TouchableOpacity>
        )}

        {/* FlatList para exibir os posts */}
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <Image source={{ uri: item.uri }} style={styles.postImage} />
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postCaption}>{item.caption}</Text>
              <Text style={styles.postDate}>{moment(item.date).format('DD/MM/YYYY HH:mm')}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.flatListContainer}
        />
      </View>
    );
  }
  

  function Workouts() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cronograma de Treinos.</Text>
        <View style={styles.calendarWrapper}>
          <FlatList
            ref={flatListRef}
            data={days}
            horizontal
            keyExtractor={(item) => item.dateString}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedDate(item.dateString)}
                style={[
                  styles.dayItem,
                  item.dateString === selectedDate && styles.selectedDayItem,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    item.dateString === selectedDate && styles.selectedDayText,
                  ]}
                >
                  {item.dayName}
                </Text>
                <Text
                  style={[
                    styles.dayNumberText,
                    item.dateString === selectedDate && styles.selectedDayNumberText,
                  ]}
                >
                  {item.dayNumber}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={todayIndex}
            getItemLayout={(data, index) => ({
              length: 70,
              offset: 70 * index,
              index,
            })}
          />
        </View>

        <View style={styles.contentBox}>
          <Text style={styles.infoText}>
            Treino do dia {moment(selectedDate).format('DD/MM/YYYY')}
          </Text>
          <Text style={styles.infoDetails}>Detalhes do treino...</Text>
        </View>
      </View>
    );
  }

  function SettingsScreen() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Configurações</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'ios-help-circle-outline';

          if (route.name === 'Treinos') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Ajustes') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF8C00',
        tabBarInactiveTintColor: '#CECECE',
        tabBarStyle: styles.navigatorStyle,
      })}
    >
      <Tab.Screen name="Inicio" component={Home} options={{ headerShown: false }} />
      <Tab.Screen name="Treinos" component={Workouts} options={{ headerShown: false }} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121015',
    paddingTop: 50,
  },
  title: {
    fontSize: 30,
    marginBottom: 10,
    marginLeft: 20,
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  calendarWrapper: {
    marginBottom: 20,
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#222',
    width: 60,
    height: 70,
  },
  selectedDayItem: {
    backgroundColor: '#FF8C00',
  },
  dayText: {
    color: '#CECECE',
    fontSize: 12,
  },
  selectedDayText: {
    color: '#FFF',
  },
  dayNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedDayNumberText: {
    color: '#FFF',
  },
  contentBox: {
    flex: 1,
    padding: 20,
    backgroundColor: '#222',
    borderRadius: 10,
  },
  infoText: {
    fontSize: 20,
    color: '#FF8C00',
    fontWeight: 'bold',
  },
  infoDetails: {
    fontSize: 16,
    color: '#CECECE',
    marginTop: 10,
  },
  navigatorStyle: {
    backgroundColor: '#121015',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },

  button: {
    position: 'absolute',
    bottom: 20, // Ajuste essa distância para onde você quer que o botão fique
    left: '50%', // Alinha horizontalmente ao centro
    transform: [{ translateX: -62.5 }], // Centraliza o botão (metade da largura do botão)
    flexDirection: 'row',
    width: 125,
    height: 50,
    alignItems: 'center',
    backgroundColor: '#FF8C00',
    padding: 10,
    borderRadius: 20,
    zIndex:10
  },
  buttonText: {
    color: '#101215',
    marginLeft: 8,
    fontWeight: 'bold'
  },
  flatListContainer: {
    alignItems: 'center', // Centraliza os itens no eixo horizontal
    paddingBottom: 20, // Espaço inferior para evitar que itens fiquem muito próximos à borda
  },
  input: {
    borderColor: '#FF8C00',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    color: '#CECECE',
  },
  postContainer: {
    width:400,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#222',
    padding: 10,
  },
  postTitle: {
    fontSize: 18,
    color: '#FF8C00',
    fontWeight: 'bold',
    marginTop: 5,
  },
  postCaption: {
    fontSize: 14,
    color: '#CECECE',
  },
  postDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },

});
