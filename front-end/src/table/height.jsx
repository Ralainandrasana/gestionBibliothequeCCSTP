// Le layout réserve 6vh au header et 94vh au contenu principal.
// Les 265px soustraits correspondent au fil d'Ariane, aux actions,
// à l'en-tête du tableau et à sa pagination. `dvh` suit immédiatement
// la hauteur réellement visible, y compris après redimensionnement.
const height = 'max(180px, calc(94dvh - 265px))';

export default height;
