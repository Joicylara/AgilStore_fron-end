
function toggleFilterDropdown(event) {
    const dropdown = document.getElementById('filterDropdown');
    
    event.stopPropagation(); 
    
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}


window.onclick = function(event) {
    const dropdown = document.getElementById('filterDropdown');
    const filterIcon = document.getElementById('filterIcon');
    if (!event.target.matches('#filterIcon') && !event.target.matches('#filterDropdown') && !event.target.matches('#filterDropdown *')) {
        dropdown.style.display = 'none';
    }
};


async function fetchProducts() {
    const category = document.getElementById('category').value;
    const orderBy = document.getElementById('orderBy').value;

    const loading = document.getElementById('loading');
    const table = document.getElementById('productTable');
    const productList = document.getElementById('productList');
    
    loading.style.display = 'block';
    table.style.display = 'none';
    
    try {
        const response = await fetch(`https://agilstore.onrender.com/listaProdutos?categoria=${category}&ordenarPor=${orderBy}`);
        
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

function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';  

    if (Array.isArray(products) && products.length > 0) {
        products.forEach(product => {
            const tr = document.createElement('tr');

           
            const nomeProduto = product.nomeProduto || 'Nome não disponível';
            const categoria = product.categoria || 'Categoria não disponível';
            const quantidadeEstoque = product.quantidadeEstoque || 'Quantidade não disponível';
            const precoFormatado = (typeof product.preco === 'number' && !isNaN(product.preco))
                ? product.preco.toFixed(2)
                : 'N/A';  

            tr.innerHTML = `
                <td>${nomeProduto}</td>
                <td>${categoria}</td>
                <td>${quantidadeEstoque}</td>
                <td>R$ ${precoFormatado}</td>
            `;
            productList.appendChild(tr);
        });
    } else {
        
        productList.innerHTML = '<tr><td colspan="4">Nenhum produto encontrado.</td></tr>';
    }
}




window.onload = function() {
    fetchProducts();  
};

document.getElementById('filterIcon').addEventListener('click', toggleFilterDropdown);

async function searchProduct() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (!searchTerm) return;  

    const loading = document.getElementById('loading');
    const table = document.getElementById('productTable');
    const productList = document.getElementById('productList');

    loading.style.display = 'block';
    table.style.display = 'none';

    try {
        const response = await fetch(`https://agilstore.onrender.com/buscaNome/${searchTerm}`);
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

