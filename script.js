

function toggleFilterDropdown(event) {
    const dropdown = document.getElementById('filterDropdown');
    const filterIcon = document.getElementById('filterIcon'); // Botão do filtro

    event.stopPropagation();
    
    // Calcular a posição do filtro e ajustar a posição do dropdown
    const rect = filterIcon.getBoundingClientRect();
    dropdown.style.left = `${rect.left}px`; // Alinha o dropdown à esquerda do botão
    dropdown.style.top = `${rect.bottom + window.scrollY}px`; // Coloca o dropdown abaixo do botão
    
    // Alternar a visibilidade
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Função para abrir o modal de adicionar produto
function openAddProductModal() {
    document.getElementById('addProductModal').style.display = 'flex';
}

// Função para fechar o modal
function closeModal() {
    document.getElementById('addProductModal').style.display = 'none';
}

// Função para adicionar um novo produto
function addProduct() {
    const nomeProduto = document.getElementById('productName').value;
    const categoria = document.getElementById('productCategory').value;
    const quantidadeEstoque = document.getElementById('productStock').value;
    const preco = document.getElementById('productPrice').value;

    // Verificar se todos os campos foram preenchidos
    if (!nomeProduto || !categoria || !quantidadeEstoque || !preco) {
        alert("Todos os campos devem ser preenchidos!");
        return;
    }

    const produto = {
        nomeProduto,
        categoria,
        quantidadeEstoque: parseInt(quantidadeEstoque),
        preco: parseFloat(preco)
    };

    // Enviar a requisição para adicionar o produto
    fetch('http://localhost:3000/novoProduto', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Novo produto adicionado:', data);
        alert('Produto adicionado com sucesso!');
        fetchCategories();
        fetchProducts();
        closeModal(); // Fecha o modal após adicionar
    })
    .catch(error => {
        console.error('Erro ao adicionar o produto:', error);
        alert('Erro ao adicionar o produto');
    });
}

function openProductModal(productId) {
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');

    // Encontre o produto correspondente
    fetch(`http://localhost:3000/buscaProduto/${productId}`)
        .then(response => response.json())
        .then(product => {
            console.log('Produto recebido da API:', product);

            // Acessar as propriedades dentro de produtoId
            const produto = product.produtoId || product;

            // Formatar o preço
            const precoFormatado = typeof produto.preco === 'number' 
                ? produto.preco.toFixed(2) 
                : (produto.preco || '');

            console.log('Preço formatado:', precoFormatado);

            // Atualize o conteúdo do modal com os dados do produto
            modalContent.innerHTML = `
                <h3>Editar Produto</h3>
                <label for="editName">Nome:</label>
                <input type="text" id="editName" value='${produto.nomeProduto || ''}' />
                <label for="editCategory">Categoria:</label>
                <input type="text" id="editCategory" value='${produto.categoria || ''}' />
                <label for="editStock">Quantidade em Estoque:</label>
                <input type="number" id="editStock" value='${produto.quantidadeEstoque || ''}' />
                <label for="editPrice">Preço:</label>
                <input type="number" id="editPrice" value='${precoFormatado}' />
                <div class="button-container">
                    <button onclick="saveProductChanges('${produto.idProduto}')">Salvar Alterações</button>
                    <button onclick="closeProductModal()">Cancelar</button>
                </div>
            `;

            // Exibir o modal
            modal.style.display = 'flex';
        })
        .catch(error => {
            alert('Erro ao carregar os dados do produto');
            console.error(error);
        });
}


// Função para fechar o modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}

// Função para salvar as alterações feitas no produto
function saveProductChanges(productId) {
    const name = document.getElementById('editName').value;
    const category = document.getElementById('editCategory').value;
    const stock = document.getElementById('editStock').value;
    const price = parseFloat(document.getElementById('editPrice').value).toFixed(2);

    fetch(`http://localhost:3000/atualizarProduto/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nomeProduto: name,
            categoria: category,
            quantidadeEstoque: stock,
            preco: price
        })
    })
        .then(response => response.json())
        .then(() => {
            alert('Produto editado com sucesso');
            fetchProducts(); // Atualiza a lista de produtos
            closeProductModal();
        })
        .catch(error => {
            alert('Erro ao editar produto');
            console.error(error);
        });
    console.log('Preço salvo:', price);
}

// Função para buscar produtos no backend com filtros aplicados
async function fetchProducts() {
    const category = document.getElementById('category').value;
    const orderBy = document.getElementById('orderBy').value;

    const loading = document.getElementById('loading');
    const table = document.getElementById('productTable');
    const productList = document.getElementById('productList');

    loading.style.display = 'block';
    table.style.display = 'none';

    try {
        const response = await fetch(`http://localhost:3000/listaProdutos?categoria=${category}&ordenarPor=${orderBy}`);
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }

        const data = await response.json();
        loading.style.display = 'none';
        table.style.display = 'block';

        if (data.listaProdutos && data.listaProdutos.length > 0) {
            displayProducts(data.listaProdutos);
        } else {
            alert('Nenhum produto encontrado com esses critérios.');
            productList.innerHTML = '';
        }
    } catch (error) {
        alert('Erro ao buscar produtos.');
        console.error(error);
    }
}

// Função para excluir um produto
function deleteProduct(productId) {
    const confirmDelete = confirm("Tem certeza que deseja excluir este produto?");
    if (confirmDelete) {
        fetch(`http://localhost:3000/deletaProduto/${productId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(() => {
                alert('Produto excluído com sucesso');
                fetchProducts();
            })
            .catch(error => {
                alert('Erro ao excluir produto');
                console.error(error);
            });
    }
}

// Função para exibir os produtos na tabela
function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    if (Array.isArray(products) && products.length > 0) {
        products.forEach(product => {
            const produto = product.produtoId || product; // Caso o produto venha aninhado
            const idProduto = produto.idProduto || 'ID não disponível';
            const nomeProduto = produto.nomeProduto || 'Nome não disponível';
            const categoria = produto.categoria || 'Categoria não disponível';
            const quantidadeEstoque = produto.quantidadeEstoque || 'Quantidade não disponível';
            const precoFormatado = produto.preco 
                ? `R$ ${parseFloat(produto.preco).toFixed(2)}`
                : 'Preço não disponível';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idProduto}</td>
                <td>${nomeProduto}</td>
                <td>${categoria}</td>
                <td>${quantidadeEstoque}</td>
                <td>${precoFormatado}</td>
                <td>
                    <button class = "button-editar" onclick="openProductModal('${idProduto}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class = "button-excluir" onclick="deleteProduct('${idProduto}')">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                </td>
            `;
            productList.appendChild(tr);
        });
    } else {
        productList.innerHTML = '<tr><td colspan="6">Nenhum produto encontrado.</td></tr>';
    }
}

async function fetchCategories() {
    const categorySelect = document.getElementById('category');
    
    try {
        // Faz a requisição para obter as categorias
        const response = await fetch('http://localhost:3000/buscaTodasCategorias');
        const data = await response.json(); // O objeto retornado tem a propriedade 'categoria'
        
        if (!data.categoria || !Array.isArray(data.categoria)) {
            throw new Error('Estrutura de dados inválida do endpoint.');
        }
        const categories = data.categoria;

        // Adiciona as categorias ao select, evitando duplicatas
        const uniqueCategories = [...new Set(categories)];
        uniqueCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        alert('Erro ao carregar categorias.');
    }
}



// Função de busca por nome de produto
async function searchProduct() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (!searchTerm) return;

    const loading = document.getElementById('loading');
    const table = document.getElementById('productTable');
    const productList = document.getElementById('productList');

    loading.style.display = 'block';
    table.style.display = 'none';

    try {
        const response = await fetch(`http://localhost:3000/buscaNome/${searchTerm}`);
        const data = await response.json();

        loading.style.display = 'none';
        table.style.display = 'block';

        if (data.produtoNome && Array.isArray(data.produtoNome) && data.produtoNome.length > 0) {
            displayProducts(data.produtoNome);
        } else {
            alert('Nenhum produto encontrado com esse nome.');
            productList.innerHTML = '';
        }
    } catch (error) {
        alert('Erro ao buscar produto.');
        console.error(error);
    }
}

// Inicializa os dados ao carregar a página
window.onload = function () {
    fetchCategories();
    fetchProducts();
};

// Adiciona o evento de clique para o ícone de filtro
document.getElementById('filterIcon').addEventListener('click', toggleFilterDropdown);
