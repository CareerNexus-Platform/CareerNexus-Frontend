import { useState } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from './CodeEditor';
import getUserId from '../../../services/getUserId';
export default function EditorPage() {
 const { sessionId } = useParams();
 const [isLightMode, setIsLightMode] = useState(false);
 return <div className={`cn-studio ${isLightMode ? 'cn-studio-light' : ''}`}><CodeEditor sessionId={sessionId} username={getUserId() || 'Guest'} onThemeBrightnessChange={setIsLightMode} /></div>;
}
