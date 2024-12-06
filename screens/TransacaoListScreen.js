import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Picker, FlatList, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { listarMoedas, obterCotacao } from '../api/cotacaoService';
import BotaoAdicionar from '../components/BotaoAdicionar';
import ModalTransacao from './ModalNovaTransacao';
import { Swipeable } from 'react-native-gesture-handler';

export default function TransacaoListScreen() {
  const [transacoes, setTransacoes] = useState([
    { id: 1, descricao: 'Compra no mercado', moeda: 'BRL', tipo: 'Despesa', valor: 150.0, categoria: 'Mercado', data: '2024-12-06T10:00:00Z' },
    { id: 2, descricao: 'Venda de item usado', moeda: 'USD', tipo: 'Receita', valor: 50.0, categoria: 'Venda', data: '2024-12-05T14:00:00Z' },
    { id: 3, descricao: 'Pagamento de aluguel', moeda: 'BRL', tipo: 'Despesa', valor: 900.0, categoria: 'Moradia', data: '2024-12-04T16:00:00Z' },
  ]);
  const [categorias, setCategorias] = useState(['Mercado', 'Venda', 'Moradia']);
  const [moedasDisponiveis, setMoedasDisponiveis] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [transacaoEditando, setTransacaoEditando] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState('');
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    const updateLayout = () => {
      const { width, height } = Dimensions.get('window');
      setIsPortrait(height >= width);
    };

    Dimensions.addEventListener('change', updateLayout);
    return () => {
      Dimensions.removeEventListener('change', updateLayout);
    };
  }, []);

  useEffect(() => {
    async function carregarMoedas() {
      const moedas = await listarMoedas();
      setMoedasDisponiveis(moedas.map((moeda) => moeda.simbolo));
    }
    carregarMoedas();
  }, []);

  const adicionarCategoria = (novaCategoria) => {
    if (!categorias.includes(novaCategoria)) {
      setCategorias([...categorias, novaCategoria]);
    }
  };

  const adicionarTransacao = async (novaTransacao) => {
    const { moeda, valor } = novaTransacao;
    if (moeda !== 'BRL') {
      const dataAtual = new Date().toISOString().split('T')[0].split('-').reverse().join('-');
      const cotacao = await obterCotacao(moeda, dataAtual);
      if (!cotacao) {
        Alert.alert('Erro', `Não foi possível obter a cotação para a moeda ${moeda}.`);
        return;
      }
      novaTransacao.valor *= cotacao.cotacaoVenda;
    }
    if (transacaoEditando) {
      setTransacoes(transacoes.map((t) => (t.id === transacaoEditando.id ? novaTransacao : t)));
    } else {
      setTransacoes([...transacoes, novaTransacao]);
    }
    setModalVisivel(false);
    setTransacaoEditando(null);
  };

  const editarTransacao = (id) => {
    const transacaoParaEditar = transacoes.find((transacao) => transacao.id === id);
    if (transacaoParaEditar) {
      setTransacaoEditando(transacaoParaEditar);
      setModalVisivel(true);
    }
  };

  const deletarTransacao = (id) => {
    setTransacoes(transacoes.filter((transacao) => transacao.id !== id));
  };

  const renderItem = ({ item }) => (
    <Swipeable
      renderLeftActions={() => (
        <TouchableOpacity style={styles.botaoEditar} onPress={() => editarTransacao(item.id)}>
          <Text style={styles.textoBotao}>Editar</Text>
        </TouchableOpacity>
      )}
      renderRightActions={() => (
        <TouchableOpacity style={styles.botaoExcluir} onPress={() => deletarTransacao(item.id)}>
          <Text style={styles.textoBotao}>Deletar</Text>
        </TouchableOpacity>
      )}
    >
      <View style={styles.card}>
        <Text style={styles.cardDescricao}>{item.descricao}</Text>
        {isPortrait ? (
          <>
            <Text style={styles.cardInfo}>Categoria: {item.categoria}</Text>
            <Text style={styles.cardInfo}>Valor: R$ {item.valor.toFixed(2)}</Text>
            <Text style={styles.cardInfo}>Data: {new Date(item.data).toLocaleDateString()}</Text>
          </>
        ) : (
          <>
            <Text style={styles.cardInfo}>Categoria: {item.categoria}</Text>
            <Text style={styles.cardInfo}>Moeda: {item.moeda}</Text>
            <Text style={styles.cardInfo}>Tipo: {item.tipo}</Text>
            <Text style={styles.cardInfo}>Hora: {new Date(item.data).toLocaleTimeString()}</Text>
            <Text style={styles.cardValor}>R$ {item.valor.toFixed(2)}</Text>
          </>
        )}
      </View>
    </Swipeable>
  );

  const transacoesFiltradas = filtro ? transacoes.filter((transacao) => transacao.categoria === filtro) : transacoes;
  const transacoesOrdenadas = ordenacao === 'Valor' ? transacoesFiltradas.sort((a, b) => a.valor - b.valor) : transacoesFiltradas;

  return (
    <View style={styles.container}>
      <View style={styles.filtros}>
        <Picker style={styles.picker} selectedValue={filtro} onValueChange={(itemValue) => setFiltro(itemValue)}>
          <Picker.Item label="Filtrar por Categoria" value="" />
          {categorias.map((categoria) => (
            <Picker.Item key={categoria} label={categoria} value={categoria} />
          ))}
        </Picker>
        <Picker style={styles.picker} selectedValue={ordenacao} onValueChange={(itemValue) => setOrdenacao(itemValue)}>
          <Picker.Item label="Ordenar por" value="" />
          <Picker.Item label="Descrição" value="Descrição" />
          <Picker.Item label="Valor" value="Valor" />
        </Picker>
      </View>
      <FlatList
        data={transacoesOrdenadas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.scrollViewContent}
        style={styles.flatList}
      />
      <View style={styles.footer}>
        <BotaoAdicionar onPress={() => setModalVisivel(true)} />
      </View>
      <ModalTransacao
        visivel={modalVisivel}
        fecharModal={() => setModalVisivel(false)}
        adicionarTransacao={adicionarTransacao}
        adicionarCategoria={adicionarCategoria}
        moedasDisponiveis={moedasDisponiveis}
        transacaoEditando={transacaoEditando}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  filtros: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  picker: { flex: 1, height: 45, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, marginRight: 10, backgroundColor: '#fafafa' },
  flatList: { flex: 1 },
  scrollViewContent: { paddingBottom: 60 },
  card: { padding: 20, margin: 12, backgroundColor: '#ffffff', borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 },
  cardDescricao: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardInfo: { fontSize: 14, color: '#666', marginVertical: 4 },
  cardValor: { fontSize: 16, color: '#28a745', fontWeight: 'bold', marginTop: 10 },
  swipeActions: { flexDirection: 'row', alignItems: 'center' },
  botaoExcluir: { backgroundColor: '#ff4d4f', padding: 15, justifyContent: 'center', alignItems: 'center' },
  botaoEditar: { backgroundColor: '#007BFF', padding: 15, justifyContent: 'center', alignItems: 'center' },
  textoBotao: { color: '#fff', fontSize: 16 },
  footer: { padding: 20, justifyContent: 'center', alignItems: 'center' },
});
