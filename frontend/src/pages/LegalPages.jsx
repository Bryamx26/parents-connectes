import Icon from '../components/Icon.jsx';
import { Link } from '../lib/router.jsx';

// Pages légales (Belgique / UE). Elles décrivent ce que le site fait réellement :
// à mettre à jour si on ajoute un traceur, un service tiers ou une donnée collectée.
const UPDATED = '17 novembre 2026';
const EMAIL = 'rishingsilvabryam@gmail.com';
const Mail = () => <a href={`mailto:${EMAIL}`}>{EMAIL}</a>;
const Todo = ({ children }) => <span className="pc-prose__todo">À COMPLÉTER : {children}</span>;
const External = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}<span className="pc-visually-hidden"> (s'ouvre dans un nouvel onglet)</span>
  </a>
);

function Legal({ title, children }) {
  return (
    <section className="pc-section" aria-labelledby="legal-title">
      <div className="pc-section__head pc-section__head--sky">
        <Icon name="book" size="lg" />
        <h1 className="pc-section__title" id="legal-title">{title}</h1>
      </div>
      <div className="pc-prose">
        <p className="pc-prose__updated">Dernière mise à jour : {UPDATED}</p>
        {children}
      </div>
    </section>
  );
}

export function LegalNoticePage() {
  return (
    <Legal title="Mentions légales">
      <h2>Éditeur du site</h2>
      <dl>
        <dt>Éditeur et créateur</dt>
        <dd>Bryam Rishing Silva, particulier (site non commercial)</dd>
        <dt>Adresse</dt>
        <dd>Cité Jardin, La Louvière (Belgique)</dd>
        <dt>Contact</dt>
        <dd><Mail /></dd>
        <dt>Responsable de la publication</dt>
        <dd>Bryam Rishing Silva</dd>
      </dl>

      <h2>Hébergement</h2>
      <dl>
        <dt>Hébergeur</dt>
        <dd>Bryam Rishing Silva, contact : <Mail /></dd>
        <dt>Serveur</dt>
        <dd>Cité Jardin, La Louvière (Belgique), site publié à l'adresse parents-connectes.bryam.tech</dd>
        <dt>Acheminement du trafic</dt>
        <dd>
          Les connexions passent par le réseau de Cloudflare, Inc. (101 Townsend St, San Francisco, CA 94107, États-Unis),
          qui protège le site et chiffre les échanges.
        </dd>
      </dl>

      <h2>Crédits</h2>
      <ul>
        <li>Design : Rajae Makhfi (<a href="mailto:rajaemakhfi6@icloud.com">rajaemakhfi6@icloud.com</a>)</li>
        <li>Développement : Bryam Rishing Silva</li>
        <li>Polices : Fredoka, Nunito et Patrick Hand (licence SIL Open Font License), servies par Google Fonts</li>
      </ul>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le design, les textes éditoriaux, les illustrations, les icônes, le logo et le code du site sont protégés
        par le droit d'auteur. Toute reproduction ou réutilisation, même partielle, demande l'accord écrit
        préalable de leurs auteurs.
      </p>
      <p>
        Les publications, activités, photos et commentaires restent la propriété des parents qui les publient.
        Les conditions de leur affichage sur le site sont décrites dans les <Link to="/cgu">conditions générales d'utilisation</Link>.
      </p>

      <h2>Données personnelles et cookies</h2>
      <p>
        Voir la <Link to="/confidentialite">politique de confidentialité</Link> et
        la <Link to="/cookies">politique de cookies</Link>.
      </p>
    </Legal>
  );
}

export function PrivacyPage() {
  return (
    <Legal title="Politique de confidentialité">
      <p>
        Cette page explique quelles données Parents Connectés traite, pourquoi, combien de temps,
        et comment exercer vos droits, conformément au Règlement général sur la protection des données (RGPD).
      </p>

      <h2>Responsable du traitement</h2>
      <p>Bryam Rishing Silva, joignable à <Mail />.</p>

      <h2>Données collectées</h2>
      <p>Vous pouvez lire les publications, les activités publiques et les quiz sans compte. Si vous créez un compte, nous traitons :</p>
      <ul>
        <li><strong>Compte</strong> : nom affiché, adresse e-mail, mot de passe (enregistré uniquement sous forme hachée, illisible), date de création.</li>
        <li><strong>Contenus que vous publiez</strong> : publications, activités et leurs étapes, photos et leur description, commentaires, J'aime, choix de visibilité (public ou privé).</li>
        <li><strong>Quiz</strong> : score obtenu et date, pour chaque quiz terminé.</li>
        <li><strong>Données techniques</strong> : adresse IP et informations de connexion transmises par votre navigateur, nécessaires pour afficher le site et limiter les tentatives de connexion abusives.</li>
      </ul>
      <p>
        Le site ne contient ni outil de mesure d'audience, ni publicité, ni bouton de réseau social, ni vidéo ou carte intégrée.
      </p>
      <p>
        Les photos publiées en mode public sont visibles par tous les visiteurs. Avant de publier une photo de votre enfant,
        pensez à ce qu'elle montre (visage, lieu, nom) : vous pouvez choisir le mode privé.
      </p>

      <h2>Finalités et bases légales</h2>
      <ul>
        <li>Créer et gérer votre compte, publier et afficher vos contenus, enregistrer vos scores : exécution du contrat que constituent les <Link to="/cgu">CGU</Link> (art. 6.1.b RGPD).</li>
        <li>Sécuriser le site (limite des tentatives de connexion, protection contre les attaques) : intérêt légitime à protéger le service et ses utilisateurs (art. 6.1.f RGPD).</li>
        <li>Afficher les polices du site : intérêt légitime à présenter un site lisible (art. 6.1.f RGPD), voir « Services tiers ».</li>
      </ul>

      <h2>Durée de conservation</h2>
      <ul>
        <li>Compte, contenus, J'aime, commentaires et scores : tant que le compte existe. À sa suppression, ils sont effacés, photos comprises.</li>
        <li>Jeton de connexion sur votre appareil : 1 heure au plus, effacé dès que vous vous déconnectez.</li>
        <li>Compteur anti-abus des connexions : 15 minutes, en mémoire seulement.</li>
        <li>Journaux techniques du serveur : 30 jours, puis suppression</li>
      </ul>

      <h2>Destinataires et services tiers</h2>
      <ul>
        <li>Vos données ne sont ni vendues ni partagées à des fins commerciales. Elles sont stockées sur le serveur de l'éditeur.</li>
        <li>
          <strong>Cloudflare, Inc.</strong> (États-Unis) achemine et protège le trafic du site : il voit passer votre adresse IP
          et les pages demandées. Ce transfert hors de l'UE est encadré par le cadre de protection des données UE–États-Unis
          (Data Privacy Framework) dont Cloudflare est adhérent.
        </li>
        <li>
          <strong>Google Fonts</strong> (Google Ireland Ltd / Google LLC) : votre navigateur télécharge les polices depuis les serveurs
          de Google, qui reçoivent votre adresse IP. Aucun cookie n'est déposé à cette occasion.
        </li>
      </ul>

      <h2>Vos droits</h2>
      <p>Vous disposez des droits suivants sur vos données :</p>
      <ul>
        <li><strong>Accès</strong> : savoir quelles données nous avons et en obtenir une copie.</li>
        <li><strong>Rectification</strong> : corriger une donnée inexacte.</li>
        <li><strong>Effacement</strong> : faire supprimer votre compte et tout ce qu'il contient.</li>
        <li><strong>Opposition</strong> : vous opposer à un traitement fondé sur l'intérêt légitime.</li>
        <li><strong>Limitation</strong> : demander le gel temporaire d'un traitement.</li>
        <li><strong>Portabilité</strong> : recevoir vos contenus dans un format courant et lisible par une machine (JSON).</li>
      </ul>

      <h2>Comment exercer vos droits</h2>
      <p>
        Écrivez à <Mail /> depuis l'adresse liée à votre compte, en précisant votre demande.
        Nous répondons dans un délai d'un mois au plus.
      </p>

      <h2>Réclamation</h2>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de
        l'Autorité de protection des données (APD), rue de la Presse 35, 1000 Bruxelles,{' '}
        <External href="https://www.autoriteprotectiondonnees.be">autoriteprotectiondonnees.be</External>.
      </p>
    </Legal>
  );
}

export function CookiesPage() {
  return (
    <Legal title="Politique de cookies">
      <p>
        Parents Connectés n'utilise <strong>aucun cookie de mesure d'audience, de publicité ou de réseau social</strong>.
        Seuls des éléments strictement nécessaires au fonctionnement sont utilisés : ils ne demandent pas votre consentement,
        c'est pourquoi le site n'affiche pas de bannière.
      </p>

      <h2>Ce qui est enregistré sur votre appareil</h2>
      <dl>
        <dt>pc-token (stockage local du navigateur, pas un cookie)</dt>
        <dd>
          Garde votre session ouverte après la connexion. Déposé seulement si vous vous connectez, valable 1 heure au plus,
          effacé à la déconnexion. Strictement nécessaire.
        </dd>
        <dt>Cookies de sécurité Cloudflare (par exemple __cf_bm, cf_clearance)</dt>
        <dd>
          Peuvent être déposés par Cloudflare pour distinguer les visiteurs des robots malveillants. Durée : 30 minutes à
          quelques jours. Strictement nécessaires à la sécurité du site.
        </dd>
      </dl>

      <h2>Services tiers sans cookie</h2>
      <p>
        Les polices sont chargées depuis Google Fonts : Google reçoit votre adresse IP mais ne dépose pas de cookie.
        Détails dans la <Link to="/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>Gérer ces éléments</h2>
      <p>
        Vous pouvez effacer cookies et stockage local depuis les réglages de votre navigateur.
        Vous serez alors simplement déconnecté. Si un jour le site ajoute un traceur non essentiel,
        votre accord vous sera demandé avant tout dépôt, et cette page sera mise à jour.
      </p>
    </Legal>
  );
}

export function TermsPage() {
  return (
    <Legal title="Conditions générales d'utilisation">
      <h2>Objet</h2>
      <p>
        Ces conditions encadrent l'utilisation de Parents Connectés, site gratuit et non commercial édité par
        Bryam Rishing Silva (voir les <Link to="/mentions-legales">mentions légales</Link>). Utiliser le site,
        c'est accepter ces conditions.
      </p>

      <h2>Accès au site</h2>
      <ul>
        <li>La lecture est libre et gratuite. Publier, commenter, aimer ou enregistrer un score de quiz demande un compte.</li>
        <li>Le compte est réservé aux personnes majeures. Vous êtes responsable de la confidentialité de votre mot de passe.</li>
        <li>Le site peut être interrompu pour maintenance ou évoluer sans préavis, sans droit à indemnité.</li>
      </ul>

      <h2>Vos publications</h2>
      <ul>
        <li>Vous restez propriétaire de vos textes et photos. Vous autorisez le site à les afficher selon la visibilité choisie (public : tous les visiteurs ; privé : vous seul), aussi longtemps qu'ils sont en ligne.</li>
        <li>Vous ne publiez que des contenus dont vous avez les droits, et des photos de personnes qui ont donné leur accord (ou de vos enfants, dont vous êtes responsable).</li>
        <li>Sont interdits : contenus illégaux, haineux, violents, à caractère sexuel, publicitaires, ou portant atteinte à la vie privée d'autrui.</li>
        <li>Vous pouvez modifier ou supprimer vos contenus à tout moment.</li>
      </ul>

      <h2>Modération</h2>
      <p>
        L'éditeur peut retirer un contenu ou suspendre un compte qui ne respecte pas ces conditions.
        Pour signaler un contenu, écrivez à <Mail />.
      </p>

      <h2>Conseils, pas avis médical</h2>
      <p>
        Les conseils, défis, quiz et activités sont des repères généraux. Ils ne remplacent pas l'avis d'un médecin,
        d'un pédiatre ou d'un professionnel de la petite enfance. Les activités proposées par les parents se font sous
        la surveillance d'un adulte.
      </p>

      <h2>Responsabilité</h2>
      <p>
        L'éditeur veille au bon fonctionnement du site sans pouvoir le garantir. Chaque parent est responsable des contenus
        qu'il publie. Les liens vers d'autres sites ne relèvent pas de l'éditeur.
      </p>

      <h2>Données personnelles</h2>
      <p>Voir la <Link to="/confidentialite">politique de confidentialité</Link> et la <Link to="/cookies">politique de cookies</Link>.</p>

      <h2>Modification et droit applicable</h2>
      <p>
        Ces conditions peuvent évoluer ; la date en haut de page indique la dernière version. Elles sont soumises au droit belge.
        En cas de litige, une solution amiable est d'abord recherchée par e-mail ; à défaut, les tribunaux belges sont compétents,
        sans préjudice des règles protégeant les consommateurs.
      </p>
    </Legal>
  );
}
