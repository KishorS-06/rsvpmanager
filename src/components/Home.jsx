import React from "react";
import "./Home.css";
import automate from "../assets/automate.png";
import brand from "../assets/brand.webp";
import brand1 from "../assets/brand1.webp";
import brand2 from "../assets/brand2.webp";
import brand3 from "../assets/brand3.webp";
import Home1 from "../assets/home1.webp";

const Home = () => {
  return (
    <div>
    <main className="hero-section">
      <div className="hero-text">
        <h1>Create any event in minutes.</h1>
        <p>Automate event management, from invite to check-in.</p>
        <button className="cta-btn">Get started for free →</button>
      </div>
      <div className="hero-images">
        <img
          src="https://images-cdn.easyweddings.com.au/s3/prod-ew-image-global-v2/Live/ImageUploader/festival-function-centre-supplierprofilelive-photo-6967684e-83af-428e-8110-bee9274a66e3.jpg?quality=80&format=jpg&mode=crop&autorotate=true&crop=20"
          alt="Event Hall"
          className="hero-img1"
        />
        <img
          src="https://cdn.larrywalshe.com/wp-content/uploads/2022/11/17132236/larry_walshe_studios_extravagent_birthday_party_austin_powers_groovy_baby_fun_playful_theme_flowers_london_8.jpg"
          alt="Dinner Party"
          className="hero-img2"
        />
        <img
          src="https://www.shaadidukaan.com/vogue/wp-content/uploads/2020/03/resort-in-jodhpur.jpg"
          alt="Decorations"
          className="hero-img3"
        />
      </div>
      <br />
        </main>
        <div>
        <img src={automate} className="autom"/>
        </div>
        <div className="containers">
          <div className="container1">
            <h3>Costomise</h3>
            <p className="p1">Take complete control of invites, registration, check-in, and more with RSVPify. Tailor to your brand or style.</p>
          </div>
          <div className="container2">
            <h3>Control</h3>
            <p className="p2">Quickly create a custom event registration experience with RSVPify with features like multi-part events, custom tags, custom questions, and more.</p>
          </div>
          <div className="container3">
            <h3>Automate</h3>
            <p className="p3">Streamline event planning and guest communications. Track and report in real-time. Scale your events.</p>
          </div>
        </div>
        <div className="contents">
          <div  className="content1">
          <h2>Event management with ease.</h2>
          <h2>From registration to showtime.</h2>
          <p>Start from a ready-made template, and customize your event website and registration or online RSVP experience from end-to-end. Track event invitees from invitation to registration to check-in.</p>
          </div>
          <span>
            <img src={brand} className="pic" />
          </span>
        </div>
        <div className="contents">
          <span>
            <img src={brand1} className="pic" />
          </span>
          <div  className="content11">
          <h2>Create brilliantly customizable event registration forms.</h2>
          <p>From themes to layout, custom questions to secondary events, online payments to online invitations, RSVPify gives you complete control over your entire event registration and online RSVP form.</p>
          </div>
        </div>
        <div className="contents">
          <div  className="content1">
          <h2>Go live in minutes with bespoke event website templates.</h2>
          <p>RSVPify’s turnkey platform takes the guess work out of event planning and guest list management. Impress guests with an on-brand, highly-customizable RSVP website and event registration experience.</p>
          </div>
          <span>
            <img src={brand2} className="pic" />
          </span>
        </div>
        <div className="contents">
          <span>
            <img src={brand3} className="picedit" />
          </span>
          <div  className="content11">
          <h2>Effortlessly Design Custom Event Registration Forms</h2>
          <p>From personalized themes to dynamic layouts, tailored questions, and multiple event options, EventEase empowers you to create a seamless event registration experience. Accept online payments, send automated invitations, and gain full control over your RSVP process.</p>
          </div>
        </div>
        <h2 class="title">The tools and features you need to plan any event</h2>

    <div class="feature-container">
        <button class="feature-card peach">
            <i class="icon">✉️</i>
            <p>email invitations</p>
        </button>
        <button class="feature-card peach">
            <i class="icon">✔️</i>
            <p>online registration & rsvp</p>
        </button>
        <button class="feature-card peach">
            <i class="icon">➕</i>
            <p>custom data collection</p>
        </button>

        <button class="feature-card purple">
            <i class="icon">📋</i>
            <p>guest list management</p>
        </button>
        <button class="feature-card purple">
            <i class="icon">📑</i>
            <p>menu preferences</p>
        </button>
        <button class="feature-card purple">
            <i class="icon">💻</i>
            <p>sub-event management</p>
        </button>

        <button class="feature-card blue">
            <i class="icon">🔒</i>
            <p>event privacy/exclusivity</p>
        </button>
        <button class="feature-card blue">
            <i class="icon">🖼️</i>
            <p>drag-and-drop seating charts</p>
        </button>
        <button class="feature-card blue">
            <i class="icon">📍</i>
            <p>check-in</p>
        </button>
    </div>
    <section class="user-reviews">
        <h2 class="section-title">User Reviews</h2>

        <div class="content-container">
            <div class="image-container">
                <img src={Home1} alt="Mobile Preview" class="mobile-img" />
            </div>

            <div class="text-container">
                <p class="subheading">RESPONSIVE AND RETINA READY</p>
                <h2 class="title">Sleek event websites and RSVP. On any device.</h2>

                <div class="feature-grid">
                    <div class="feature">
                        <div class="icon">💻</div>
                        <h3>Responsive layout</h3>
                        <p>Our event website templates are fully responsive. Your site will look perfect on any device.</p>
                    </div>
                    <div class="feature">
                        <div class="icon">📱</div>
                        <h3>Preview on mobile</h3>
                        <p>Preview your event website and emails on desktop and mobile, all within RSVPify.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
        </div>
  );
};

export default Home;