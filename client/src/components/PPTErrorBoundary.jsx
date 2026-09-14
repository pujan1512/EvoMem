import React from 'react';

export default class PPTErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('PowerPointViewer crashed:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary, #888)' }}>
                    <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
                        Couldn't display this presentation.
                    </p>
                    <p style={{ fontSize: '0.9rem' }}>
                        The file may be missing or not a valid .pptx. Try uploading a real presentation from the admin panel.
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}