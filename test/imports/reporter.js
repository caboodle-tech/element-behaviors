const reporter = () => {
    let state = [];

    return {
        getState: () => [...state],
        registerAdopted: () => {
            state.push('ADOPTED');
        },
        registerAttributeChange: () => {
            state.push('CHANGED');

        },
        registerConnected: () => {
            state.push('CONNECTED');
        },
        registerDisconnected: () => {
            state.push('DISCONNECTED');
        },
        reset: () => {
            state = [];
        },
        testPassed: (ary) => {
            if (ary.length !== state.length) {
                return false;
            }

            for (let i = 0; i < state.length; i++) {
                if (ary[i] !== state[i]) {
                    return false;
                }
            }

            return true;
        }
    };
};

export default reporter();
