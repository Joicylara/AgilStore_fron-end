

function toggleFilterDropdown(event) {
    const dropdown = document.getElementById('filterDropdown');
    const filterIcon = document.getElementById('filterIcon'); 

    event.stopPropagation();
    
    
    const rect = filterIcon.getBoundingClientRect();
    dropdown.style.left = `${rect.left}px`; 
    dropdown.style.top = `${rect.bottom + window.scrollY}px`; 
    
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function openAddProductModal() {
    document.getElementById('addProductModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('addProductModal').style.display = 'none';
}

function addProduct() {
    const nomeProduto = document.getElementById('productName').value;
    const categoria = document.getElementById('productCategory').value;
    const quantidadeEstoque = document.getElementById('productStock').value;
    const preco = document.getElementById('productPrice').value;

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

    fetch('http://localhost:3000/novoProduto', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
    })
    .then(response => response.json())
    .then(data => {
        alert('Produto adicionado com sucesso!');
        fetchCategories();
        fetchProducts();
        closeModal();
    })
    .catch(error => {
        console.error('Erro ao adicionar o produto:', error);
        alert('Erro ao adicionar o produto');
    });
}

function openProductModal(productId) {
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');

    fetch(`http://localhost:3000/buscaProduto/${productId}`)
        .then(response => response.json())
        .then(product => {
            const produto = product.produtoId || product;
            const precoFormatado = typeof produto.preco === 'number' 
                ? produto.preco.toFixed(2) 
                : (produto.preco || '');

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

            modal.style.display = 'flex';
        })
        .catch(error => {
            alert('Erro ao carregar os dados do produto');
            console.error(error);
        });
}


function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}

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
            fetchProducts(); 
            closeProductModal();
        })
        .catch(error => {
            alert('Erro ao editar produto');
            console.error(error);
        });
}

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

function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    if (Array.isArray(products) && products.length > 0) {
        products.forEach(product => {
            const produto = product.produtoId || product;
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
    categorySelect.innerHTML = categorySelect.querySelector('option').outerHTML;
    
    try {
        const response = await fetch('http://localhost:3000/buscaTodasCategorias');
        const data = await response.json(); 
        
        if (!data.categoria || !Array.isArray(data.categoria)) {
            throw new Error('Estrutura de dados inválida do endpoint.');
        }
        const categories = data.categoria;
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

window.onload = function () {
    fetchCategories();
    fetchProducts();
};

document.getElementById('filterIcon').addEventListener('click', toggleFilterDropdown);
