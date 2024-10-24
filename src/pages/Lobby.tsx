import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Modal } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/pt-br';
import * as ImagePicker from 'expo-image-picker';
import { storage, firestore } from '../firebaseConfig'; // Certifique-se de importar o Firestore
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';


interface Post {
  id: string;
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
    const [carouselPosts, setCarouselPosts] = useState<Post[]>([]);
    const [mainPost, setMainPost] = useState<Post | null>(null);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [isCarousel, setIsCarousel] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isImageSelected, setIsImageSelected] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [updateCount, setUpdateCount] = useState(0);
    const [mainsPostSelected, setMainPostSelected] = useState(false)


    //função para atualizar pagina
    const forceRefresh = () => {
      setUpdateCount(prev => prev + 1);
    };

    // Função para carregar posts do Firestore
    const loadPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'posts'));
        const carouselPostsData: Post[] = [];
        let mainPostData: Post | null = null;
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const post = {
            id: doc.id,
            uri: data.uri || '',
            title: data.title || '',
            caption: data.caption || '',
            date: data.date || '',
            isMainPost: data.isMainPost || false,
          };
  
          if (post.isMainPost) {
            mainPostData = post;
          } else {
            carouselPostsData.push(post);
          }
        });
  
        // Ordenar os posts de carrossel pela data
        carouselPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
        setCarouselPosts(carouselPostsData);
        setMainPost(mainPostData);
      } catch (error) {
        console.error('Erro ao carregar posts', error);
      }
    };
  
    const handleImagePick = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [25, 25],
        quality: 1,
      });
  
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setIsImageSelected(true); // Atualiza o estado quando uma imagem é selecionada
      }
    };

    const handleDeletePost = async (postID: string, imageURL: string) => {
      try {

        if (imageURL){
          const imageRef = ref(storage, imageURL);
          await deleteObject (imageRef);
          console.log("Imagem deletada do storage");
        }

        await deleteDoc(doc(firestore, "posts", postID))
        forceRefresh()
        console.log("ID excluido do firestore")
      } catch (error){
        console.log("Erro ao apagar post")
      }    
    }
  
    const uploadImage = async () => {
      if (!imageUri) return;
    
      // Define como "uploading" antes de qualquer operação começar
      setIsUploading(true); // inicia o upload
      console.log('isUploading:', isUploading);
    
      try {
        // Faz o upload da imagem
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const imageRef = ref(storage, `images/${Date.now()}`);
        await uploadBytes(imageRef, blob);
        const url = await getDownloadURL(imageRef);
    
        // Define os dados do novo post
        const newPost = {
          uri: url,
          title,
          caption,
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
          isMainPost: !isCarousel,
        };
    
        // Se for post de carrossel, verifica se já existem 5 e apaga o mais antigo
        if (isCarousel) {
          const querySnapshot = await getDocs(collection(firestore, 'posts'));
          const carouselPostsData: Post[] = [];
    
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.isMainPost) {
              carouselPostsData.push({
                id: doc.id,
                ...data,
                uri: '',
                title: '',
                caption: '',
                date: '',
              });
            }
          });
    
          if (carouselPostsData.length >= 5) {
            const oldestPost = carouselPostsData[carouselPostsData.length - 1];
            await deleteDoc(doc(firestore, 'posts', oldestPost.id));
          }
        } else {
          // Se for post principal, apaga o anterior
          if (mainPost) {
            await deleteDoc(doc(firestore, 'posts', mainPost.id));
          }
        }
    
        // Adiciona o novo post ao Firestore
        const newPostRef = await addDoc(collection(firestore, 'posts'), newPost);
        const completePost: Post = { id: newPostRef.id, ...newPost };
    
        // Atualiza o estado local
        if (isCarousel) {
          setCarouselPosts((prev) => [completePost, ...prev]);
        } else {
          setMainPost(completePost);
        }
    
        // Reseta os estados após o upload
        setImageUri(null);
        setTitle('');
        setCaption('');
        setIsImageSelected(false);
        console.log('isImageSelected:', isImageSelected);
      } catch (error) {
        console.error('Erro ao adicionar post ao Firestore', error);
      } finally {
        // Assegura que isUploading seja falso ao final do processo
        setIsUploading(false); // termina o upload
        forceRefresh()
      }

      
    };

  
    useEffect(() => {
      loadPosts();
    }, []);
  
    return (
      <View style={styles.container} >
        <Text style={styles.title}>Bem-vindo, Usuário.</Text>
  
        {/* Carrossel de posts pequenos */}
        <FlatList
          data={carouselPosts}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.carouselPostContainer}>
              <Image source={{ uri: item.uri }} style={styles.carouselPostImage} />
              <Text style={styles.postTitle}>{item.title}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.carouselContainer}
        />
        <View style={styles.parentContainerMainPost}>
          {/* Post principal grande */}
          {mainPost && (
            <View style={styles.mainPostContainer}>
              <Image source={{ uri: mainPost.uri }} style={styles.mainPostImage} />
              <Text style={styles.mainPostTitle}>{mainPost.title}</Text>
              <Text style={styles.mainPostCaption}>{mainPost.caption}</Text>
              <Text style={styles.mainPostDate}>{moment(mainPost.date).format('DD/MM/YYYY HH:mm')}</Text>
              <TouchableOpacity 
              style={[{position: 'absolute', right:15, bottom: 15}]}
              onPress={() => handleDeletePost(mainPost.id, mainPost.uri)}
              >
                <Ionicons name = 'trash-outline' size={24} color = "#101215"/>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* Modal para selecionar tipo de post */}
        <Modal visible={modalVisible} transparent>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.buttomAddPost} onPress={() => { setIsCarousel(true); setModalVisible(false); handleImagePick(); }}>
              <Text style={styles.modalOption}>Adicionar ao carrossel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttomAddPost, {marginTop: 20}]} onPress={() => { setIsCarousel(false); setModalVisible(false); handleImagePick(); }}>
              <Text style={styles.modalOption}>Adicionar ao post principal</Text>
            </TouchableOpacity>
          </View>
        </Modal>
  
        {/* Botão de adicionar */}

        {!isUploading && !imageUri && ( // Renderiza o botão apenas se não estiver fazendo upload
        <TouchableOpacity
            style={[styles.button, isImageSelected && { opacity: 0.5 }]}
            onPress={() => setModalVisible(true)}
            disabled={isImageSelected}
        >
            <Ionicons name="add-circle-outline" size={24} color="#101215" />
            <Text style={styles.buttonText}>Adicionar</Text>
        </TouchableOpacity>
    )}
  
        {/* Carregar pré-visualização da imagem */}
        {imageUri && !isCarousel && (
          <>

            <TextInput
            style = {styles.input}
            placeholder="Digite o título do post principal"
            value={title}
            onChangeText={setTitle} // Atualiza o estado da legenda
            />    

            <TextInput
              style = {[styles.input, {marginTop: 60}] }
              placeholder="Digite a legenda do post principal"
              value={caption}
              onChangeText={setCaption} // Atualiza o estado da legenda
            />

            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity style={[styles.button, {justifyContent: 'center'}]} onPress={uploadImage}>
            <Ionicons name="cloud-upload-outline" size={24} color="#101215" />
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </>
        )}
                {imageUri && isCarousel && (
          <>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity style={[styles.button, {justifyContent: 'center'}]} onPress={uploadImage}>
            <Ionicons name="cloud-upload-outline" size={24} color="#101215" />
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </>
        )}
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
    borderRadius: 8,
    position: 'absolute',
    top:'40%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: 350,
    height: 300,
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
    position:'absolute',
    marginTop: 5,
    top: '80%',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    color: '#CECECE',
    width: 350,
    backgroundColor: '#222',
    alignSelf: 'center'
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

  // Estilo para o carrossel de posts pequenos
  carouselContainer: {
    marginBottom: 24,
  },
  carouselPostContainer: {
    marginRight: 16,
    alignItems: 'center',
  },
  carouselPostImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  // Estilo para o post principal grande

  parentContainerMainPost:{ 
    position: 'absolute',
    top:'40%',
    alignItems: 'center',
    width: '100%'
  },
  mainPostContainer: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#333',
    borderRadius: 12,
    width: '90%'
  },
  mainPostImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  mainPostTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mainPostCaption: {
    fontSize: 16,
    marginBottom: 8,
  },
  mainPostDate: {
    fontSize: 12,
    color: '#888',
  },
  // Estilo para o botão de adicionar

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: 200,
    textAlign: 'center',
    color:'#FF8C00',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttomAddPost: {
    justifyContent: 'center',
    width: 180,
    height: 100,
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 20,
  },
});
