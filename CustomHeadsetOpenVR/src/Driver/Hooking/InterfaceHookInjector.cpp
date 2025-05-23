#include "../DriverLog.h"
#include "Hooking.h"
#include "InterfaceHookInjector.h"
#include "../DeviceProvider.h"

static CustomHeadsetDeviceProvider *Driver = nullptr;

static Hook<void*(*)(vr::IVRDriverContext *, const char *, vr::EVRInitError *)> 
	GetGenericInterfaceHook("IVRDriverContext::GetGenericInterface");

static Hook<void(*)(vr::IVRServerDriverHost *, uint32_t, const vr::DriverPose_t &, uint32_t)>
	TrackedDevicePoseUpdatedHook005("IVRServerDriverHost005::TrackedDevicePoseUpdated");

static Hook<void(*)(vr::IVRServerDriverHost *, uint32_t, const vr::DriverPose_t &, uint32_t)>
	TrackedDevicePoseUpdatedHook006("IVRServerDriverHost006::TrackedDevicePoseUpdated");

static Hook<void(*)(vr::IVRServerDriverHost *_this, const char *pchDeviceSerialNumber, vr::ETrackedDeviceClass eDeviceClass, vr::ITrackedDeviceServerDriver *pDriver)>
	TrackedDeviceAddedHook006("IVRServerDriverHost006::TrackedDeviceAdded");

// static void DetourTrackedDevicePoseUpdated005(vr::IVRServerDriverHost *_this, uint32_t unWhichDevice, const vr::DriverPose_t &newPose, uint32_t unPoseStructSize)
// {
// 	//TRACE("ServerTrackedDeviceProvider::DetourTrackedDevicePoseUpdated(%d)", unWhichDevice);
// 	auto pose = newPose;
// 	if (Driver->HandleDevicePoseUpdated(unWhichDevice, pose))
// 	{
// 		TrackedDevicePoseUpdatedHook005.originalFunc(_this, unWhichDevice, pose, unPoseStructSize);
// 	}
// }

// static void DetourTrackedDevicePoseUpdated006(vr::IVRServerDriverHost *_this, uint32_t unWhichDevice, const vr::DriverPose_t &newPose, uint32_t unPoseStructSize)
// {
// 	//TRACE("ServerTrackedDeviceProvider::DetourTrackedDevicePoseUpdated(%d)", unWhichDevice);
// 	auto pose = newPose;
// 	if (Driver->HandleDevicePoseUpdated(unWhichDevice, pose))
// 	{
// 		TrackedDevicePoseUpdatedHook006.originalFunc(_this, unWhichDevice, pose, unPoseStructSize);
// 	}
// }

static void DetourTrackedDeviceAdded006(vr::IVRServerDriverHost *_this, const char *pchDeviceSerialNumber, vr::ETrackedDeviceClass eDeviceClass, vr::ITrackedDeviceServerDriver *pDriver)
{
	if (Driver->HandleDeviceAdded(pchDeviceSerialNumber, eDeviceClass, pDriver))  
	{
		TrackedDeviceAddedHook006.originalFunc(_this, pchDeviceSerialNumber, eDeviceClass, pDriver);
	}
}

static void *DetourGetGenericInterface(vr::IVRDriverContext *_this, const char *pchInterfaceVersion, vr::EVRInitError *peError)
{
	Driver->driverContexts.insert(_this);  // Store the driver context for later use
	
	// TRACE("ServerTrackedDeviceProvider::DetourGetGenericInterface(%s)", pchInterfaceVersion);
	auto originalInterface = GetGenericInterfaceHook.originalFunc(_this, pchInterfaceVersion, peError);

	std::string iface(pchInterfaceVersion);
	if (iface == "IVRServerDriverHost_005")
	{
		// if (!IHook::Exists(TrackedDevicePoseUpdatedHook005.name))
		// {
		// 	TrackedDevicePoseUpdatedHook005.CreateHookInObjectVTable(originalInterface, 1, &DetourTrackedDevicePoseUpdated005);
		// 	IHook::Register(&TrackedDevicePoseUpdatedHook005);
		// }
	}
	else if (iface == "IVRServerDriverHost_006")
	{
		// if (!IHook::Exists(TrackedDevicePoseUpdatedHook006.name))
		// {
		// 	TrackedDevicePoseUpdatedHook006.CreateHookInObjectVTable(originalInterface, 1, &DetourTrackedDevicePoseUpdated006);
		// 	IHook::Register(&TrackedDevicePoseUpdatedHook006);
		// }
		if (!IHook::Exists(TrackedDeviceAddedHook006.name))
		{
			TrackedDeviceAddedHook006.CreateHookInObjectVTable(originalInterface, 0, &DetourTrackedDeviceAdded006);
			IHook::Register(&TrackedDeviceAddedHook006);
		}
	}

	return originalInterface;
}

void InjectHooks(CustomHeadsetDeviceProvider *driver, vr::IVRDriverContext *pDriverContext)
{
	Driver = driver;

	auto err = MH_Initialize();
	if (err == MH_OK)
	{
		GetGenericInterfaceHook.CreateHookInObjectVTable(pDriverContext, 0, &DetourGetGenericInterface);
		IHook::Register(&GetGenericInterfaceHook);
	}
	else
	{
		DriverLog("MH_Initialize error: %s", MH_StatusToString(err));
	}
}

void DisableHooks()
{
	IHook::DestroyAll();
	MH_Uninitialize();
}