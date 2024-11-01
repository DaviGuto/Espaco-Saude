import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Modal} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/pt-br';
import * as ImagePicker from 'expo-image-picker';
import { storage, firestore } from '../firebaseConfig'; // Certifique-se de importar o Firestore
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';






interface Post {
  id: string;
  uri: string;
  title: string;
  caption: string;
  date: string;
}
export function Home() {
  
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [carouselPosts, setCarouselPosts] = useState<Post[]>([]);
    const [mainPost, setMainPost] = useState<Post | null>(null);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [isCarousel, setIsCarousel] = useState(true);
    const [typePostVisible, setTypePostVisible] = useState(false);
    const [editPostVisible, setEditPostVisible] = useState(false);
    const [openPost, setOpenPost] = useState(false);
    const [openCarouselPost, setOpenCarouselPost] = useState(false);
    const [selectedCarouselPost, setSelectedCarouselPost] = useState<Post|null>(null);
    const [configPost, setConfigPost] = useState(false);
    const [isImageSelected, setIsImageSelected] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [updateCount, setUpdateCount] = useState(0);
    const flatListRef = useRef<FlatList>(null);
  



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
        quality: 1,
      });
  
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setIsImageSelected(true); // Atualiza o estado quando uma imagem é selecionada
      }
    };

    const handleEditPost = async (postID: string, newTitle: string, newCaption: string) =>{
      try{
        const postRef = doc(firestore, 'posts', postID);

        await updateDoc (postRef, {
          title: newTitle,
          caption: newCaption
        });

        console.log('documento atualizado');

      }catch(error){
        console.error('não foi possivel carregar post', error);
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

    // Função para abrir o modal e definir o post selecionado
    const handleOpenCarouselPost = (post: Post ) => {
      setSelectedCarouselPost(post); // Define o post selecionado
      setOpenCarouselPost(true); // Abre o modal
    };
  
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
        
          // Verifique se existem posts suficientes
          if (carouselPostsData.length >= 5) {
            // Ordena os posts por data (assumindo que a data está no formato correto)
            carouselPostsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            const oldestPost = carouselPostsData[0]; // O mais antigo agora será o primeiro após a ordenação
        
            try {
              await deleteDoc(doc(firestore, 'posts', oldestPost.id));
              console.log(`Post ${oldestPost.id} excluído com sucesso`);
            } catch (error) {
              console.error("Erro ao excluir o post:", error);
            }
          }
        } else {
          // Se for post principal, apaga o anterior
          if (mainPost) {
            try {
              await deleteDoc(doc(firestore, 'posts', mainPost.id));
              console.log(`Post principal ${mainPost.id} excluído com sucesso`);
            } catch (error) {
              console.error("Erro ao excluir o post principal:", error);
            }
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
              <TouchableOpacity  onPress={() => handleOpenCarouselPost(item)} >
                <Image source={{ uri: item.uri }} style={styles.carouselPostImage} />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.carouselContainer}
        />
        <View style={styles.parentContainerMainPost}>
          {/* Post principal grande */}
          {mainPost && (
            <View style={styles.mainPostContainer}>
              <TouchableOpacity onPress={() => setOpenPost(true)}>
                <Image source={{ uri: mainPost.uri }} style={styles.mainPostImage} />
              </TouchableOpacity>
              <Text style={styles.postTitle}>{mainPost.title}</Text>
              <Text style={styles.mainPostCaption}>{mainPost.caption}</Text>
              <Text style={styles.mainPostDate}>{moment(mainPost.date).format('DD/MM/YYYY HH:mm')}</Text>
              <TouchableOpacity 
              style={[{position: 'absolute', right:15, bottom: 15}]}
              onPress={() => setConfigPost(true)}
              >
                <Ionicons name = 'ellipsis-vertical-outline' size={24} color = "#101215"/>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Modal para configurar post*/}
        <Modal visible = {configPost} transparent 
        onRequestClose = {() => setConfigPost(false)} 
        animationType = "fade"
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.buttomAddPost}
            onPress={()=> {setEditPostVisible(true); setConfigPost(false);}}
            >
              <Text style={styles.modalOption}> Editar Post </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.buttomAddPost, {marginTop: 20}]} 
            onPress={() => {setConfigPost(false); handleDeletePost(mainPost?.id ?? '', mainPost?.uri ?? '');
            }}>
              <Text style={styles.modalOption}> Excluir Post </Text>
            </TouchableOpacity>

          </View>
        </Modal>
        
        {/*Modal para editar Post*/}
        <Modal visible = {editPostVisible}
        transparent
        onRequestClose = {() => setEditPostVisible(false)}
        animationType = "fade"
        >
          <View style = {styles.containerEditPost}>
          <Text style={[styles.titleEditPost, {alignSelf:'center'}, {fontSize:20}, {marginBottom: 20}]}>Editar Post</Text>
          <Text style={[styles.titleEditPost]}>Título:</Text>
            <TextInput  
            style = {styles.inputEditPost}
            placeholder = "Digite novo título"
            placeholderTextColor='#CECECE'
            value = {title}
            onChangeText={setTitle}
            />


            <Text style={[styles.titleEditPost, {marginTop: 10}]}>Legenda:</Text>
            <TextInput  
            style = {[styles.inputEditPost]}
            placeholder = "Digite nova legenda"
            placeholderTextColor='#CECECE'
            value = {caption}
            onChangeText={setCaption}
            />

            <TouchableOpacity
            style = {[styles.buttonEditPost]}
            onPress={() => {handleEditPost(mainPost?.id ?? '', title, caption); setEditPostVisible(false); }}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="#101215" />
              <Text style={styles.buttonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>

        </Modal>

        {/* Modal para selecionar tipo de post */}
        <Modal visible={typePostVisible} 
        transparent 
        onRequestClose={() => setTypePostVisible(false)}
        animationType = "fade"
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.buttomAddPost} onPress={() => { setIsCarousel(true); setTypePostVisible(false); handleImagePick(); }}>
              <Text style={styles.modalOption}>Adicionar ao carrossel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttomAddPost, {marginTop: 20}]} onPress={() => { setIsCarousel(false); setTypePostVisible(false); handleImagePick(); }}>
              <Text style={styles.modalOption}>Adicionar ao post principal</Text>
            </TouchableOpacity>
          </View>
        </Modal>

      {/*Modal para abrir imagem do post principal */}
        <Modal 
          visible={openPost}
          transparent
          onRequestClose={() => setOpenPost(false)}
          animationType="fade"
        >
          <View style={styles.containerOpenPost}>
            {mainPost?.uri ? (
              <View style ={[{alignItems:'center'}]}>
                <Text style={[styles.postTitle, {fontSize: 20}, {marginBottom: 10}]}>{mainPost.title}</Text>
                <Image source={{ uri: mainPost.uri }} style={styles.mainOpenPostImage} />
                <Text style={[styles.postCaption, {fontSize: 20}]}>{mainPost.caption}</Text>
              </View>
            ) : (
              <Text>Imagem não disponível</Text>
            )}
            
          </View>
        </Modal>
          

          {/*Modal para abrir imagem do carrossel */}
        <Modal 
          visible={openCarouselPost}
          transparent
          onRequestClose={() => setOpenCarouselPost(false)}
          animationType="fade"
        >
          <View style={[styles.containerOpenPost, {width: 350}, {height: 450}]}>
            {selectedCarouselPost ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.title, { fontSize: 20, marginBottom: 10 }]}>
                  {selectedCarouselPost.title}
                </Text>
                <Image source={{ uri: selectedCarouselPost.uri }} style={styles.mainOpenPostImage} />
                <Text style={[styles.postCaption, { fontSize: 20, marginTop: 10 }]}>
                  {selectedCarouselPost.caption}
                </Text>
              </View>
            ) : (
              <Text>Imagem não disponível</Text>
            )}

            <TouchableOpacity style={[styles.buttonEditPost, 
              {position: 'absolute', 
              bottom: 10, 
              right: 10, 
              padding: 10,
              backgroundColor: '#222',
              width:50
              }]}>
              <Ionicons name="trash-outline" size={24} color="#101215"/>
            </TouchableOpacity>
          </View>
      </Modal>

  
        {/* Botão de adicionar */}

        {!isUploading && !imageUri && !editPostVisible && ( // Renderiza o botão apenas se não estiver fazendo upload
        <TouchableOpacity
            style={[styles.button, isImageSelected && { opacity: 0.5 }]}
            onPress={() => setTypePostVisible(true)}
            disabled={isImageSelected}
        >
            <Ionicons name="add-circle-outline" size={24} color="#101215" />
            <Text style={styles.buttonText}>Adicionar</Text>
        </TouchableOpacity>
    )}
        
        {/* Carregar pré-visualização da imagem */}

        {imageUri && !isCarousel && (

          
          <View style={styles.containerPreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />

            <Text style={[styles.titleEditPost]}>Título:</Text>
            <TextInput
              style={styles.inputPreview}
              placeholder="Digite o título do post principal"
              placeholderTextColor='#CECECE'
              value={title}
              onChangeText={setTitle} 
            />

            <Text style={[styles.titleEditPost, {marginTop: 10}]}>Legenda:</Text>
            <TextInput
              style={styles.inputPreview}
              placeholder="Digite a legenda do post principal"
              placeholderTextColor='#CECECE'
              value={caption}
              onChangeText={setCaption} 
            />

            <TouchableOpacity style={styles.buttonPreview} onPress={uploadImage}>
              <Ionicons name="cloud-upload-outline" size={24} color="#101215" />
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        )}

        {imageUri && isCarousel && (
          <View style={[styles.containerPreview, {height:350}]}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.buttonPreview} onPress={uploadImage}>
              <Ionicons name="cloud-upload-outline" size={24} color="#101215" />
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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

  navigatorStyle: {
    backgroundColor: '#121015',
  },
  /*Estilo para preview de imagem*/
  containerPreview: {
    flex: 1,
    position: 'absolute',
    top: '30%',
    width: 300,
    height: 510, // Aumenta a altura para acomodar todos os elementos
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: '#222',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start', // Mantém o conteúdo no topo
  },
  
  inputPreview: {
    borderWidth: 1,
    borderColor: '#CECECE',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    color: '#CECECE',
    width: '103%', 
    backgroundColor: '#333',
  },
  
  previewImage: {
    width: '100%',
    height: 200, // Ajuste para caber melhor no layout
    resizeMode: 'contain',
    marginBottom: 15, // Espaçamento para separar da entrada de texto
  },
  
  buttonPreview: {
    marginTop: 20, // Espaçamento adicional para separar do TextInput
    flexDirection: 'row',
    width: 125,
    height: 50,
    alignItems: 'center',
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 20,
  },



  postImage: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },

  button: {
    position: 'absolute',
    bottom: 20, 
    left: '50%', 
    transform: [{ translateX: -62.5 }], 
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
    alignItems: 'center',
    paddingBottom: 20, 
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

  containerEditPost: {
    flex: 1,
    position: 'absolute',
    top: '40%',
    borderRadius: 8,
    alignSelf: 'center',
    alignItems: 'center',
    width: 300,
    height: 330, 
    backgroundColor: '#222',
    padding: 20, 
  },
  
  inputEditPost: {
    borderWidth: 1,
    borderColor: '#CECECE',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    color: '#CECECE',
    width: 270,
    backgroundColor: '#222',
    
  },
  buttonEditPost:{
    position: 'absolute',
    bottom: 20, 
    flexDirection: 'row',
    width: 115,
    height: 50,
    alignItems: 'center',
    backgroundColor: '#FF8C00',
    padding: 10,
    borderRadius: 20,
  },
  
  titleEditPost: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 0, 
  },

  //Estilo do post aberto

  containerOpenPost:{
    flex: 1,
    position: 'absolute',
    top: 150,
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: '#222',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',

  },

  mainOpenPostImage: {
    width: '100%',
    height: 250,
    aspectRatio:1,
    resizeMode: 'contain', 
    marginVertical: 10,
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
    marginBottom: 2,
  },
  mainPostTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  mainPostCaption: {
    fontSize: 16,
    marginBottom: 30,
    marginTop: 8  ,
    color: '#CECECE'
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




