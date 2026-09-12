import { showPage } from './ui/navigation';
import { selectZone } from './ui/action-plan';
import './ui/calculator';

// Retain the existing HTML event handlers without altering the document content.
Object.assign(window, { showPage, selectZone });
