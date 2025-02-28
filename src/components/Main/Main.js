import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import CampaignForm from "../Forms/CampaignForm";
import ConfigForm from "../Forms/ConfigForm";
import ProgressBar from "../ProgressBar/ProgressBar";
import SuccessScreen from "../SuccessScreen";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../Main/MainStyles.module.css";
import SetupAdAccountModal from "../Modals/SetupAdAccountModal";  // Import the modal
import axios from "axios";
import config from '../../config';

const apiUrl = config.apiUrl;
const facebookAdsApiUrl = config.facebookAdsApiUrl;
const socket = io(`${facebookAdsApiUrl}`);

const getDefaultStartTime = () => {
  const startTime = new Date();
  startTime.setUTCDate(startTime.getUTCDate() + 1);
  startTime.setUTCHours(4, 0, 0, 0);
  return startTime.toISOString().slice(0, 16);
};

const getDefaultEndTime = () => {
  const endTime = new Date();
  endTime.setUTCDate(endTime.getUTCDate() + 2);
  endTime.setUTCHours(4, 0, 0, 0);
  return endTime.toISOString().slice(0, 16);
};

const Main = ({ activeAccount, setActiveAccount }) => {
  const [formId, setFormId] = useState("mainForm");
  const [previousForm, setPreviousForm] = useState("mainForm");
  const [progress, setProgress] = useState(0);
  const [stepVisible, setStepVisible] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState("website");
  const [campaignType, setCampaignType] = useState("new");
  const [existingCampaigns, setExistingCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(() => activeAccount ? !activeAccount.is_bound : false);
  const [isActiveSubscription, setIsActiveSubscription] = useState(false);
  const [userPlan, setUserPlan] = useState('');
  const [activeAdAccountsCount, setActiveAdAccountsCount] = useState(0);

  // Store all AbortControllers
  const abortControllersRef = useRef(new Set());

  // Function to create and track a new AbortController
  const getAbortController = () => {
    const controller = new AbortController();
    abortControllersRef.current.add(controller);
    return controller;
  };

  // Cleanup function to cancel all ongoing requests on unmount
  useEffect(() => {
    return () => {
      abortControllersRef.current.forEach(controller => controller.abort());
      abortControllersRef.current.clear();
    };
  }, []);

  // Check if activeAccount is bound
  useEffect(() => {
    setShowModal(prev => (activeAccount && !activeAccount.is_bound ? true : false));
  }, [activeAccount]);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      const controller = getAbortController();
      try {
        const userPlanResponse = await axios.get(`${apiUrl}/payment/subscription-status/${activeAccount.id}`, {
          withCredentials: true,
          signal: controller.signal,
        });
        setIsActiveSubscription(userPlanResponse.data.is_active);

        const usersPlanResponse = await axios.get(`${apiUrl}/payment/user-subscription-status`, {
          withCredentials: true,
          signal: controller.signal,
        });
        setUserPlan(usersPlanResponse.data.plan);

        const adAccountsResponse = await axios.get(`${apiUrl}/payment/active-ad-accounts`, {
          withCredentials: true,
          signal: controller.signal,
        });
        setActiveAdAccountsCount(adAccountsResponse.data.count);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching subscription data:", error);
          toast.error("Error fetching subscription details.");
        }
      } finally {
        abortControllersRef.current.delete(controller);
      }
    };

    fetchSubscriptionData();
  }, [activeAccount]);
  

  // Reset the form when activeAccount changes
  useEffect(() => {
    if (activeAccount) {
      resetForm();  // Reset the form when the active account changes
    }
  }, [activeAccount]);

  const resetForm = () => {
    setFormId("mainForm");
    setCampaignType("new");
    setExistingCampaigns([]);
    setSelectedCampaign("");
  };

  const handleObjectiveSelect = (objective) => {
    setSelectedObjective(objective);
    setSelectedCampaign("");  // Clear the selected campaign on objective change
  
    const objectiveMap = {
      website: "OUTCOME_SALES",
      lead: "OUTCOME_LEADS",
      traffic: "OUTCOME_TRAFFIC",
    };
  
    setConfig((prevConfig) => ({
      ...prevConfig,
      objective: objectiveMap[objective],
    }));
  };  

  const handleCampaignTypeSelect = async (type) => {
    setCampaignType(type);
  
    if (type === "existing" && activeAccount) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v17.0/${activeAccount.ad_account_id}/campaigns?fields=id,name,status,objective&access_token=${activeAccount.access_token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          // console.log("Campaigns Data:", data.data);
  
          if (data.data && data.data.length > 0) {
            // Filter campaigns based on the selected objective
            const filteredCampaigns = data.data.filter(
              (campaign) => campaign.objective === config.objective
            );
            if (filteredCampaigns.length > 0) {
              setExistingCampaigns(filteredCampaigns); // Populate campaigns with the filtered ones
            } else {
              let objectiveMessage = "";
              switch (config.objective) {
                case "OUTCOME_SALES":
                  objectiveMessage = "No sales campaigns available for this ad account.";
                  break;
                case "OUTCOME_LEADS":
                  objectiveMessage = "No lead campaigns available for this ad account.";
                  break;
                case "OUTCOME_TRAFFIC":
                  objectiveMessage = "No traffic campaigns available for this ad account.";
                  break;
                default:
                  objectiveMessage = "No campaigns available for this objective.";
              }
              toast.info(objectiveMessage);
              setExistingCampaigns([]); // Clear previous campaigns
            }
          } else {
            toast.info("No campaigns available for this ad account.");
            setExistingCampaigns([]); // Clear any previous campaigns
          }
        } else {
          toast.warning("Please connect an Ad account first");
          setExistingCampaigns([]); // Clear any previous campaigns
        }
      } catch (error) {
        console.error("Error fetching existing campaigns from Facebook:", error);
        toast.warning(
          "Error fetching existing campaigns, Please ensure an Ad account is connected."
        );
        setExistingCampaigns([]); // Clear any previous campaigns
      }
    }
  };  

  // Re-fetch campaigns when objective changes
  useEffect(() => {
    if (campaignType === "existing") {
      handleCampaignTypeSelect("existing");
    }
  }, [selectedObjective]);

  const handleCampaignSelect = (event) => {
    setSelectedCampaign(event.target.value);
    setDropdownOpen(false);
  };

  const [step, setStep] = useState("");
  const [config, setConfig] = useState({
    objective: "OUTCOME_SALES",
    campaign_budget_optimization: "AD_SET_BUDGET_OPTIMIZATION",
    budget_value: "50.73",
    campaign_bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    buying_type: "AUCTION",
    object_store_url: "",
    location: "GB",
    age_range_min: "30",
    age_range_max: "65",
    gender: "All",
    app_events: getDefaultStartTime(),
    ad_creative_primary_text: "",
    ad_creative_headline: "",
    ad_creative_description: "",
    call_to_action: "SHOP_NOW",
    destination_url: "",
    url_parameters: "",
    ad_set_budget_value: "50.73",
    ad_format: "Single image or video",
    bid_amount: "5.0",
    end_time: getDefaultEndTime(),
    ad_set_bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    prediction_id: "",
    placement_type: "advantage_plus",
    platforms: {
      facebook: true,
      instagram: true,
      audience_network: true,
      messenger: true,
    },
    placements: {
      feeds: true,
      stories: true,
      in_stream: true,
      search: true,
      apps_sites: true,
      messages: true,
    },
  });

  const [taskId, setTaskId] = useState(null);
  const [uploadController, setUploadController] = useState(null);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    let progressData = null;
    let logInterval = null;

    socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    socket.on("progress", (data) => {
      if (data.task_id === taskId) {
        progressData = data;
        setProgress(data.progress);
        setStep(data.step);
        setStepVisible(true);
        console.log("Received progress:", data);
      }
    });

    socket.on("task_complete", (data) => {
      if (data.task_id === taskId) {
        clearInterval(logInterval);
        setFormId("successScreen");
        toast.success("Ad created successfully!");
      }
    });

    socket.on("error", (data) => {
      if (data.task_id === taskId) {
        clearInterval(logInterval);
        
        const errorTitle = data.title;
        const errorMessage = data.message || "An unexpected error occurred";
        
        toast.error(
          <>
            Error: <br />
            {errorTitle} <br />
            {errorMessage}
          </>
        );
        
        setFormId("mainForm");
      }
    });

    logInterval = setInterval(() => {
      if (progressData) {
        console.log(
          "Progress:",
          progressData.progress,
          "Step:",
          progressData.step
        );
      }
    }, 500);

    return () => {
      clearInterval(logInterval);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("progress");
      socket.off("task_complete");
      socket.off("error");
    };
  }, [taskId]);

  const handleShowForm = async (formId) => {
    if (!isActiveSubscription) {
      toast.info("Please choose a subscription plan for the selected ad account before creating an ad.");
      return;
    }
  
    if (userPlan === "Enterprise" && activeAdAccountsCount < 2) {
      toast.info("Please purchase a second ad account to activate and enjoy the Enterprise plan.");
      return;
    }
  
    if (!activeAccount || !activeAccount.is_bound) {
      toast.warning("Please connect an ad account to create campaigns.");
      return;
    }
  
    if (userPlan === "Free Trial") {
      try {
        const response = await axios.post(`${apiUrl}/payment/has-used-free-trial`, {
          ad_account_id: activeAccount.ad_account_id
        }, { withCredentials: true });
  
        if (response.data.has_used_free_trial) {
          toast.warning("This ad account has already used a free trial. Please choose a subscription plan!");
          return;
        }
      } catch (error) {
        console.error("Error checking free trial usage:", error);
        toast.error("Could not verify free trial usage.");
        return;
      }
    }
  
    if (campaignType === "existing" && formId === "next" && !selectedCampaign) {
      toast.warning("Please select an existing campaign before proceeding.");
      return;
    }
  
    if (formId === "configForm") {
      setPreviousForm(formId);
    } else {
      setPreviousForm(formId);
      setFormId(
        campaignType === "new" && formId === "next"
          ? "newCampaignForm"
          : campaignType === "existing" && formId === "next"
          ? "existingCampaignForm"
          : formId
      );
    }
    setShowHeader(formId === "mainForm");
  };  

  const handleEditConfig = () => {
    setPreviousForm(formId);
    setFormId("configForm");
  };

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    setFormId(previousForm);
  };

  const handleCancelConfig = () => {
    setFormId(previousForm);
  };

  const handleCancel = () => {
    if (uploadController) {
      uploadController.abort();
      setUploadController(null);
      toast.info("Upload canceled.");
    }

    if (taskId) {
      fetch(`${facebookAdsApiUrl}/cancel_task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId }),
      })
        .then((response) => response.json())
        .then((data) => {
          toast.info(data.message);
          setFormId("mainForm");
        })
        .catch((error) => {
          toast.error("An error occurred while canceling the upload.");
          setFormId("mainForm");
        });
    }
  };

  const handleSubmit = (formData, isNewCampaign) => {
    const taskId = `task-${Math.random().toString(36).substr(2, 9)}`;
    setTaskId(taskId);
    formData.append("task_id", taskId);

    // console.log("activeAccount:", activeAccount);

    if (!activeAccount || !activeAccount.ad_account_id) {
      toast.error("Ad account details are missing.");
      return;
    }

    const adAccountConfig = {
      ad_account_id: activeAccount.ad_account_id,
      app_id: activeAccount.app_id,
      app_secret: activeAccount.app_secret,
      access_token: activeAccount.access_token,
    };

    Object.entries(adAccountConfig).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // console.log("Final formData entries before submission:");
    // for (const pair of formData.entries()) {
    //   console.log(`${pair[0]}: ${pair[1]}`);
    // }

    const controller = new AbortController();
    setUploadController(controller);

    setProgress(0);
    setStepVisible(false);

    fetch(`${facebookAdsApiUrl}/create_campaign`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          setFormId("mainForm");
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.log("Upload canceled by user");
        } else {
          toast.error("An error occurred while creating the campaign.");
        }
        setFormId("mainForm");
      });

    handleShowForm("progress");
  };

  return (
    <div className={styles.container}>
      {showModal && (
        <SetupAdAccountModal 
          onClose={() => setShowModal(false)} 
          activeAccount={activeAccount}
          setActiveAccount={setActiveAccount} 
        />
      )}

      {formId === "mainForm" && (
        <div className={styles.formContainer}>
          <h2 className={styles.heading}>Choose Campaign Objective</h2>
          <div className={styles.objectiveContainer}>
            <div
              className={`${styles.objective} ${
                selectedObjective === "website" ? styles.selected : ""
              }`}
              onClick={() => handleObjectiveSelect("website")}
            >
              <div className={styles.icon}>
                <img
                  src="./assets/Website-Ad--Streamline-Atlas.png"
                  alt="Website Conversions"
                />
              </div>
              <div className={styles.content}>
                <h3>Website Conversions</h3>
                <p>
                  Send people to your website and track conversions using the FB
                  Pixel.
                </p>
              </div>
            </div>
            <div
              className={`${styles.objective} ${
                selectedObjective === "lead" ? styles.selected : ""
              }`}
              onClick={() => handleObjectiveSelect("lead")}
            >
              <div className={styles.icon}>
                <img
                  src="./assets/Device-Tablet-Search--Streamline-Tabler.png"
                  alt="Lead Form Campaign"
                />
              </div>
              <div className={styles.content}>
                <h3>Lead Form Campaign</h3>
                <p>Capture leads using instant forms from your ad account.</p>
              </div>
            </div>
            <div
              className={`${styles.objective} ${
                selectedObjective === "traffic" ? styles.selected : ""
              }`}
              onClick={() => handleObjectiveSelect("traffic")}
            >
              <div className={styles.icon}>
                <img
                  src="./assets/Click--Streamline-Tabler.png"
                  alt="Traffic Campaign"
                />
              </div>
              <div className={styles.content}>
                <h3>Traffic Campaign</h3>
                <p>
                  Drive more visitors to your website through targeted traffic
                  campaigns.
                </p>
              </div>
            </div>
          </div>

          <h2 className={styles.heading}>Configure Your Campaign</h2>
          <div className={styles.campaignTypeContainer}>
            <button
              className={`${styles.campaignTypeButton} ${
                campaignType === "new" ? styles.selected : ""
              }`}
              onClick={() => handleCampaignTypeSelect("new")}
            >
              <img
                className={styles.buttonIcon}
                src="./assets/Component 2.png"
                alt="New Campaign"
              />
              New Campaign
            </button>
            <button
              className={`${styles.campaignTypeButton} ${
                campaignType === "existing" ? styles.selected : ""
              }`}
              onClick={() => handleCampaignTypeSelect("existing")}
            >
              <img
                className={styles.buttonIcon}
                src="./assets/Component 2 (1).png"
                alt="Existing Campaign"
              />
              Existing Campaign
            </button>
          </div>

          {campaignType === "existing" && existingCampaigns.length > 0 && (
            <div className={styles.dropdownContainer}>
              <label htmlFor="campaignSelect"></label>
              <div className={styles.customDropdown}>
                <div
                  className={styles.dropdownHeader}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {selectedCampaign
                    ? existingCampaigns.find(
                        (campaign) => campaign.id === selectedCampaign
                      ).name
                    : "Select a campaign"}
                </div>
                {dropdownOpen && (
                  <div className={styles.dropdownList}>
                    {existingCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className={styles.dropdownItem}
                        onClick={() =>
                          handleCampaignSelect({
                            target: { value: campaign.id },
                          })
                        }
                      >
                        <input
                          type="checkbox"
                          checked={selectedCampaign === campaign.id}
                          onChange={() =>
                            handleCampaignSelect({
                              target: { value: campaign.id },
                            })
                          }
                        />
                        <span>{campaign.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            className={styles.nextButton}
            onClick={() => handleShowForm("next")}
          >
            Next
          </button>
        </div>
      )}

      {formId === "newCampaignForm" && (
        <CampaignForm
          formId="newCampaign"
          onSubmit={handleSubmit}
          onEditConfig={handleEditConfig}
          onGoBack={() => handleShowForm("mainForm")}
          isNewCampaign={true}
          activeAccount={activeAccount}
          objective={config.objective} // Pass selected objective
        />
      )}

      {formId === "existingCampaignForm" && (
        <CampaignForm
          formId="existingCampaign"
          onSubmit={handleSubmit}
          onEditConfig={handleEditConfig}
          onGoBack={() => handleShowForm("mainForm")}
          isNewCampaign={false}
          activeAccount={activeAccount}
          campaignId={selectedCampaign} // Pass the selected campaign ID
          objective={config.objective} // Pass selected objective
        />
      )}

      {formId === "configForm" && (
        <ConfigForm
          activeAccount={activeAccount}
          initialConfig={config}
          onSaveConfig={handleSaveConfig}
          onCancel={handleCancelConfig}
          isNewCampaign={previousForm === "newCampaignForm"}
        />
      )}

      {formId === "progress" && (
        <div className={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            step={step}
            stepVisible={stepVisible}
          />
          <button className={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}
      {formId === "successScreen" && (
        <SuccessScreen onGoBack={() => handleShowForm("mainForm")} />
      )}
    </div>
  );
};

export default Main;
