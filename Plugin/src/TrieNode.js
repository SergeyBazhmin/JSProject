export default class TrieNode{
    constructor(character){
        this.children = {};
        this.terminals = {};
        this.character = character;
    }
    hasChild(character)
    {
        return this.children[character] !== undefined;
    }
    addChild(character)
    {
        this.children[character] = new TrieNode(character);
    }
    addTerminal(idx)
    {
        this.terminals[idx] = idx;
    }
}
