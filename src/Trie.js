import TrieNode from './TrieNode';
class Trie {
    constructor(){
        this.root = new TrieNode('');
    }

    addWord(text, bookmarkId){
        const characters = Array.from(text);
        let currentNode = this.root;
        for (let char of characters)
        {
            if (!currentNode.hasChild(char))
                currentNode.addChild(char);
            currentNode = currentNode.children[char];
        }
        currentNode.addTerminal(bookmarkId);
    }

    searchNode(currentNode, text)
    {
        const characters = Array.from(text);
        let current = currentNode;
        for( let char of characters)
        {
            if (!current.hasChild(char))
                return null;
            current = current.children[char];
        }
        return current;
    }

    getAllWithPrefix(prefix)
    {
        const node = this.searchNode(this.root, prefix);
        const indices = [];
        if (!node)
            return indices;
        const findOther = (node) => {
            for (let id in node.terminals)
                indices.push(id);
            for (let char in node.children)
                findOther(node.children[char]);
        };
        findOther(node);
        return indices;
    }
}
export const titleTrie = new Trie();
export const categoryTrie = new Trie();
