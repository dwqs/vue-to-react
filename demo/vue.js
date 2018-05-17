export default {
    name: 'demo-test',
    data () {
        return {
            title: 'vue to react',
            msg: 'Hello world'
        }
    },

    render () {
        return (
            <div>
                <p>{this.title}</p>
                <p>{this.msg}</p>
            </div>
        )
    }
}